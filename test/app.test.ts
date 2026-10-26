import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/server/app.js";
import { Store } from "../src/server/store.js";
import { createEngine } from "../src/diagnosis/engine.js";
import { cfg, mkCase } from "./helpers.js";

async function boot(opts: { now: () => number; gas?: number }) {
  const sent: { destination: string; text: string }[] = [];
  const app = createApp({
    config: cfg,
    apiKey: "key_123",
    engine: createEngine({}),
    store: new Store(),
    senders: { telegram: async (destination, text) => void sent.push({ destination, text }) },
    gasOracle: async () => opts.gas,
    now: opts.now,
  });
  const server = createServer((req, res) => void app.handle(req, res));
  await new Promise<void>((r) => server.listen(0, r));
  server.unref();
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body: unknown, key = "key_123") =>
    fetch(base + path, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}`, connection: "close" }, body: JSON.stringify(body) });
  const close = () => { server.closeAllConnections(); server.close(); };
  return { app, server, base, post, sent, close };
}

const NOON = Date.UTC(2026, 9, 26, 12, 0, 0);
const contact = { channel: "telegram", destination: "555", consentGivenAt: NOON - 5000 };

test("requires the api key", async () => {
  const s = await boot({ now: () => NOON });
  assert.equal((await s.post("/v1/cases", {}, "nope")).status, 401);
  s.close();
});

test("diagnoses, plans, sends after the delay, and reports measured lift inputs", async () => {
  let clock = NOON;
  const s = await boot({ now: () => clock });
  const c = mkCase([["tx_signature_requested"], ["abandoned"]], { chainId: 1, targetChainId: 8453 }, "case_a");

  const res = await s.post("/v1/cases", { case: c, contact });
  const body: any = await res.json();
  assert.equal(body.diagnosis.cause, "wrong_network");
  assert.equal(body.plan.decision, "send");
  assert.equal(s.sent.length, 0);

  assert.equal(await s.app.tick(), 0); // too early
  clock += 6 * 60_000;
  assert.equal(await s.app.tick(), 1);
  assert.equal(s.sent[0]!.destination, "555");
  assert.ok(s.sent[0]!.text.includes("https://mint.moonpass.xyz/resume?t="));

  // the resume link verifies and tells the site what to do
  const token = new URL(body.plan.resumeUrl).searchParams.get("t")!;
  const resume: any = await (await fetch(`${s.base}/v1/resume?t=${encodeURIComponent(token)}`)).json();
  assert.equal(resume.ok, true);
  assert.equal(resume.action.type, "switch_chain");

  assert.equal((await s.post("/v1/outcomes", { caseId: "case_a", converted: true })).status, 200);
  const report: any = await (await fetch(`${s.base}/v1/report`, { headers: { authorization: "Bearer key_123" } })).json();
  assert.equal(report.lift.treatedRate, 1);
  assert.equal(report.casesByCause.wrong_network, 1);
  s.close();
});

test("a conditional gas message waits until the oracle reports a lower price", async () => {
  let clock = NOON;
  const s = await boot({ now: () => clock, gas: 80 });
  const c = mkCase([["tx_signature_requested"], ["abandoned"]], { gasGwei: 90, gasBaselineGwei: 30 }, "case_g");
  const body: any = await (await s.post("/v1/cases", { case: c, contact })).json();
  assert.equal(body.plan.condition.type, "gas_below");
  assert.equal(await s.app.tick(), 0);
  s.close();

  const s2 = await boot({ now: () => clock, gas: 25 });
  await s2.post("/v1/cases", { case: c, contact });
  assert.equal(await s2.app.tick(), 1);
  s2.close();
});

test("a converted case is dropped from the queue and never messaged", async () => {
  let clock = NOON;
  const s = await boot({ now: () => clock });
  const c = mkCase([["tx_signature_requested"], ["abandoned"]], { chainId: 1, targetChainId: 8453 }, "case_c");
  await s.post("/v1/cases", { case: c, contact });
  await s.post("/v1/outcomes", { caseId: "case_c", converted: true });
  clock += 10 * 60_000;
  assert.equal(await s.app.tick(), 0);
  s.close();
});

test("rejects malformed cases and oversized bodies", async () => {
  const s = await boot({ now: () => NOON });
  assert.equal((await s.post("/v1/cases", { case: { id: "" } })).status, 400);
  const huge = { case: { id: "x", context: {}, events: [], pad: "a".repeat(70_000) } };
  assert.equal((await s.post("/v1/cases", huge)).status, 413);
  s.close();
});
