import test from "node:test";
import assert from "node:assert/strict";
import { createResumeToken, verifyResumeToken } from "../src/recovery/resumeLink.js";
import { checkMessage, inQuietHours, nextAllowedTime } from "../src/recovery/safety.js";
import { planRecovery } from "../src/recovery/policy.js";
import { PLAYBOOKS, renderTemplate } from "../src/recovery/playbooks.js";
import { CAUSE_IDS } from "../src/taxonomy.js";
import { cfg, mkCase } from "./helpers.js";
import type { Diagnosis } from "../src/types.js";

const NOW = Date.UTC(2026, 9, 26, 12, 0, 0);
const diag = (cause: Diagnosis["cause"], confidence = 0.9): Diagnosis => ({ cause, confidence, source: "rules", evidence: ["e"], alternatives: [] });
const contact = { channel: "telegram" as const, destination: "123", consentGivenAt: NOW - 1000 };
const history = { sentForCase: 0, sentToContactLast7d: 0, converted: false };

test("resume tokens verify, reject tampering and expire", () => {
  const tok = createResumeToken("s3cret", { p: "p1", c: "case1", a: { type: "retry" }, e: NOW + 1000 });
  assert.equal(verifyResumeToken("s3cret", tok, NOW).ok, true);
  assert.deepEqual((verifyResumeToken("wrong", tok, NOW) as any).reason, "bad_signature");
  const [body, sig] = tok.split(".");
  const forged = Buffer.from(JSON.stringify({ v: 1, p: "p1", c: "case1", a: { type: "switch_chain", params: { chainId: 1 } }, e: NOW + 1000 })).toString("base64url");
  assert.equal((verifyResumeToken("s3cret", `${forged}.${sig}`, NOW) as any).reason, "bad_signature");
  assert.equal((verifyResumeToken("s3cret", tok, NOW + 5000) as any).reason, "expired");
  assert.equal((verifyResumeToken("s3cret", "garbage", NOW) as any).reason, "malformed");
  assert.ok(body);
});

test("safety vetoes phishing style language and foreign links", () => {
  const ok = checkMessage("Hi, your pass stopped. Reopen it here: https://mint.moonpass.xyz/resume?t=abc", cfg);
  assert.equal(ok.ok, true);
  assert.equal(checkMessage("Urgent! Verify your wallet: https://mint.moonpass.xyz/x", cfg).ok, false);
  assert.equal(checkMessage("Reopen here: https://mint-moonpass.xyz/x", cfg).ok, false);
  assert.equal(checkMessage("Reopen here: https://mint.moonpass.xyz.evil.io/x", cfg).ok, false);
  assert.equal(checkMessage("No link at all", cfg).ok, false);
});

test("every playbook template passes the safety check once rendered", () => {
  for (const [cause, pb] of Object.entries(PLAYBOOKS)) {
    const text = renderTemplate(pb!.template, { project: cfg.name, item: cfg.itemName, link: "https://mint.moonpass.xyz/resume?t=abc" });
    const r = checkMessage(text, cfg);
    assert.equal(r.ok, true, `${cause}: ${r.reasons.join(", ")}`);
  }
});

test("quiet hours shift the send time", () => {
  const q = { startHour: 22, endHour: 8, utcOffsetMinutes: 330 };
  const night = Date.UTC(2026, 9, 26, 18, 0, 0); // 23:30 in India
  assert.equal(inQuietHours(night, q), true);
  const next = nextAllowedTime(night, q);
  assert.ok(next > night && !inQuietHours(next, q));
  assert.equal(nextAllowedTime(NOW, q), NOW);
});

test("a recoverable, consented case is planned with a verified link", () => {
  const c = mkCase([["tx_signature_requested"], ["abandoned"]], { chainId: 1, targetChainId: 8453 });
  const plan = planRecovery({ case: c, diagnosis: diag("wrong_network"), config: cfg, contact, history, now: NOW });
  assert.equal(plan.decision, "send");
  if (plan.decision === "send") {
    assert.ok(plan.message.includes("https://mint.moonpass.xyz/resume?t="));
    assert.equal(plan.resume.action.type, "switch_chain");
    assert.equal(plan.resume.action.params?.chainId, 8453);
  }
});

test("deliberate causes and weak diagnoses are never messaged", () => {
  const c = mkCase([["tx_rejected", { code: 4001 }]]);
  const run = (d: Diagnosis) => planRecovery({ case: c, diagnosis: d, config: cfg, contact, history, now: NOW });
  assert.equal((run(diag("user_declined")) as any).reason, "respect_decline");
  assert.equal((run(diag("security_warning_abandon")) as any).reason, "education_disabled");
  assert.equal((run(diag("gas_shock", 0.4)) as any).reason, "low_confidence");
  assert.equal((run(diag("unknown", 0.9)) as any).reason, "low_confidence");
});

test("no consent, caps, conversion and holdout all stop the message", () => {
  const c = mkCase([["abandoned"]], { chainId: 1, targetChainId: 8453 });
  const d = diag("wrong_network");
  const base = { case: c, diagnosis: d, config: cfg, now: NOW };
  assert.equal((planRecovery({ ...base, history }) as any).reason, "no_consented_channel");
  assert.equal((planRecovery({ ...base, contact: { channel: "telegram", destination: "1" }, history }) as any).reason, "no_consented_channel");
  assert.equal((planRecovery({ ...base, contact, history: { ...history, sentForCase: 2 } }) as any).reason, "cap_reached");
  assert.equal((planRecovery({ ...base, contact, history: { ...history, sentToContactLast7d: 3 } }) as any).reason, "cap_reached");
  assert.equal((planRecovery({ ...base, contact, history: { ...history, converted: true } }) as any).reason, "already_converted");
  const allHoldout = { ...cfg, holdoutPct: 0.5, holdoutSalt: "x" };
  const reasons = new Set<string>();
  for (let i = 0; i < 40; i++) reasons.add((planRecovery({ ...base, case: { ...c, id: `c${i}` }, config: allHoldout, contact, history }) as any).reason ?? "send");
  assert.ok(reasons.has("holdout") && reasons.has("send"));
});

test("a skipped case still carries a resume link for the onsite banner", () => {
  const c = mkCase([["abandoned"]], { chainId: 1, targetChainId: 8453 });
  const plan = planRecovery({ case: c, diagnosis: diag("wrong_network"), config: cfg, history, now: NOW });
  assert.equal(plan.decision, "skip");
  assert.ok(plan.decision === "skip" && plan.resume?.url.startsWith("https://mint.moonpass.xyz/resume?t="));
});

test("gas shock waits for a condition derived from the baseline", () => {
  const c = mkCase([["tx_signature_requested"], ["abandoned"]], { gasGwei: 90, gasBaselineGwei: 30 });
  const plan = planRecovery({ case: c, diagnosis: diag("gas_shock"), config: cfg, contact, history, now: NOW });
  assert.equal(plan.decision, "send");
  if (plan.decision === "send") assert.deepEqual(plan.condition, { type: "gas_below", gwei: 39 });
});

test("every non deliberate recoverable cause has a playbook", () => {
  for (const id of CAUSE_IDS) {
    if (["unknown", "user_declined"].includes(id)) continue;
    assert.ok(PLAYBOOKS[id], `missing playbook for ${id}`);
  }
});
