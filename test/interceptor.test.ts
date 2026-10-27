import { test } from "node:test";
import assert from "node:assert/strict";
import { createProviderInterceptor } from "../src/sdk/interceptor.js";
import type { TimelineEvent } from "../src/types.js";

test("provider interceptor wraps provider without breaking methods", async () => {
  const events: TimelineEvent[] = [];
  const fakeProvider = {
    async request(args: { method: string; params?: unknown }) {
      if (args.method === "eth_requestAccounts") return ["0x1234567890abcdef1234567890abcdef12345678"];
      if (args.method === "eth_signTypedData_v4") return "0xsig12345";
      if (args.method === "failing_call") {
        const err: any = new Error("User denied transaction signature");
        err.code = 4001;
        throw err;
      }
      return true;
    },
    on() {},
    removeListener() {},
  };

  const intercepted = createProviderInterceptor(fakeProvider, (e) => events.push(e));

  // Connect flow
  const accounts = await intercepted.request({ method: "eth_requestAccounts" });
  assert.deepEqual(accounts, ["0x1234567890abcdef1234567890abcdef12345678"]);
  assert.equal(events[0]?.type, "connect_requested");
  assert.equal(events[1]?.type, "session_approved");

  // EIP-712 typed signature flow
  const sig = await intercepted.request({ method: "eth_signTypedData_v4", params: [] });
  assert.equal(sig, "0xsig12345");
  assert.equal(events[2]?.type, "tx_signature_requested");
  assert.equal(events[3]?.type, "tx_submitted");

  // Rejection handling
  await assert.rejects(
    async () => intercepted.request({ method: "failing_call" }),
    (err: any) => err.code === 4001,
  );
  const lastEvent = events[events.length - 1];
  assert.equal(lastEvent?.type, "tx_rejected");
  assert.equal(lastEvent?.code, 4001);
});
