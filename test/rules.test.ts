import test from "node:test";
import assert from "node:assert/strict";
import { runRules } from "../src/diagnosis/rules.js";
import { mkCase } from "./helpers.js";

test("code -32002 means a request is already pending", () => {
  const d = runRules(mkCase([["connect_requested"], ["session_rejected", { code: -32002 }]], { flow: "connect" }));
  assert.equal(d?.cause, "request_already_pending");
  assert.ok(d!.confidence >= 0.9);
});

test("4902 after a failed chain switch means the chain is not in the wallet", () => {
  const d = runRules(mkCase([["chain_switch_requested"], ["chain_switch_failed", { code: 4902 }]]));
  assert.equal(d?.cause, "chain_not_added");
});

test("chain mismatch plus a stop is wrong_network", () => {
  const d = runRules(mkCase([["tx_signature_requested"], ["abandoned"]], { chainId: 1, targetChainId: 8453 }));
  assert.equal(d?.cause, "wrong_network");
  assert.match(d!.evidence[0]!, /chain 1/);
});

test("gas at 3x baseline then leaving is gas_shock", () => {
  const d = runRules(mkCase([["tx_signature_requested"], ["abandoned"]], { gasGwei: 90, gasBaselineGwei: 30 }));
  assert.equal(d?.cause, "gas_shock");
});

test("a security warning beats gas when both are present", () => {
  const d = runRules(mkCase([["security_warning_shown"], ["tx_rejected", { code: 4001 }]], { gasGwei: 90, gasBaselineGwei: 30 }));
  assert.equal(d?.cause, "security_warning_abandon");
});

test("revert reasons split sold out, slippage and funds", () => {
  assert.equal(runRules(mkCase([["tx_reverted", { message: "Max supply reached" }]]))?.cause, "sold_out_or_not_eligible");
  assert.equal(runRules(mkCase([["tx_reverted", { message: "Slippage exceeded" }]]))?.cause, "slippage_or_quote_expired");
  assert.equal(runRules(mkCase([["tx_reverted", { message: "insufficient funds for gas" }]]))?.cause, "insufficient_funds");
});

test("deep link fired and wallet never opened is deeplink_blocked", () => {
  const d = runRules(mkCase([["connect_requested"], ["deeplink_fired"], ["abandoned"]], { flow: "connect", inAppBrowser: true }));
  assert.equal(d?.cause, "deeplink_blocked");
});

test("a bare 4001 with normal conditions is user_declined, not a recoverable cause", () => {
  const d = runRules(mkCase([["tx_signature_requested"], ["tx_rejected", { code: 4001 }]], { gasGwei: 20, gasBaselineGwei: 20, balanceSufficient: true }));
  assert.equal(d?.cause, "user_declined");
});

test("no signal returns null", () => {
  assert.equal(runRules(mkCase([["connect_requested"], ["abandoned"]])), null);
});
