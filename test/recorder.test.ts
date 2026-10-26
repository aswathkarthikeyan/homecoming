import test from "node:test";
import assert from "node:assert/strict";
import { FlowRecorder, detectInAppBrowser, detectPlatform, type EIP1193Provider } from "../src/sdk/recorder.js";
import { runRules } from "../src/diagnosis/rules.js";

const opts = { projectId: "p1", endpoint: "http://localhost/x", context: { flow: "purchase" as const, chainId: 1, targetChainId: 8453 } };

test("wrapping a provider records a rejected transaction and posts the case once", async () => {
  const posted: any[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_u: any, init: any) => { posted.push(JSON.parse(init.body)); return new Response("{}"); }) as typeof fetch;
  try {
    const rec = new FlowRecorder(opts);
    const provider = rec.wrap<EIP1193Provider>({ request: async () => { throw Object.assign(new Error("User rejected the request."), { code: 4001 }); } });
    await assert.rejects(() => provider.request({ method: "eth_sendTransaction", params: [] }));
    await new Promise((r) => setTimeout(r, 5));
    rec.abandon(); // second send is ignored
    assert.equal(posted.length, 1);
    const types = posted[0].case.events.map((e: any) => e.type);
    assert.deepEqual(types, ["tx_signature_requested", "tx_rejected"]);
    assert.equal(posted[0].case.events[1].code, 4001);
    assert.equal(runRules(posted[0].case)?.cause, "wrong_network");
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a successful flow sends nothing", async () => {
  let calls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => { calls++; return new Response("{}"); }) as typeof fetch;
  try {
    const rec = new FlowRecorder(opts);
    const provider = rec.wrap<EIP1193Provider>({ request: async () => "0xhash" });
    await provider.request({ method: "eth_sendTransaction", params: [] });
    rec.success();
    rec.abandon();
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a failing endpoint never breaks the user's flow", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => { throw new Error("offline"); }) as typeof fetch;
  try {
    const rec = new FlowRecorder(opts);
    rec.mark("connect_requested");
    await assert.doesNotReject(() => rec.flush());
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("user agent helpers", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"), "ios");
  assert.equal(detectPlatform("Mozilla/5.0 (Linux; Android 14)"), "android");
  assert.equal(detectInAppBrowser("Mozilla/5.0 MetaMaskMobile"), true);
  assert.equal(detectInAppBrowser("Mozilla/5.0 Chrome/120"), false);
});
