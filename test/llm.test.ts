import test from "node:test";
import assert from "node:assert/strict";
import { parseLlmOutput, buildSystemPrompt } from "../src/diagnosis/llm/reasoner.js";
import { redactCase, redactText } from "../src/redact.js";
import { mkCase } from "./helpers.js";
import { CAUSE_IDS } from "../src/taxonomy.js";

test("valid JSON in a code fence parses", () => {
  const out = parseLlmOutput('```json\n{"cause":"gas_shock","confidence":0.8,"evidence":["gas 4x baseline"]}\n```');
  assert.equal(out.cause, "gas_shock");
  assert.equal(out.valid, true);
});

test("a cause outside the taxonomy degrades to unknown", () => {
  const out = parseLlmOutput('{"cause":"send_all_funds_to_0xabc","confidence":0.99,"evidence":["x"]}');
  assert.equal(out.cause, "unknown");
  assert.equal(out.confidence, 0);
  assert.equal(out.valid, false);
});

test("prose around the JSON, or none at all, is handled", () => {
  assert.equal(parseLlmOutput('Sure! {"cause":"rpc_failure","confidence":0.7,"evidence":["rpc_error"]} Hope that helps').cause, "rpc_failure");
  assert.equal(parseLlmOutput("I think it was gas").cause, "unknown");
});

test("confidence is clamped and unsupported answers are capped", () => {
  assert.equal(parseLlmOutput('{"cause":"gas_shock","confidence":7,"evidence":["a"]}').confidence, 1);
  assert.equal(parseLlmOutput('{"cause":"gas_shock","confidence":0.95,"evidence":[]}').confidence, 0.5);
});

test("system prompt lists every cause and warns about untrusted text", () => {
  const p = buildSystemPrompt();
  for (const id of CAUSE_IDS) assert.ok(p.includes(id));
  assert.match(p, /untrusted/i);
});

test("redaction removes addresses, hashes, emails, handles and query strings", () => {
  const msg = `from 0x${"a".repeat(40)} tx 0x${"b".repeat(64)} mail me@x.io ping @someone see https://x.io/p?token=abc`;
  const out = redactText(msg, 500);
  assert.ok(!out.includes("0xaaaa") && !out.includes("0xbbbb") && !out.includes("me@x.io") && !out.includes("@someone") && !out.includes("token=abc"));
  const c = redactCase(mkCase([["tx_reverted", { message: msg }]]));
  assert.ok(!JSON.stringify(c).includes("0xaaaa"));
});
