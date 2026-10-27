import { test } from "node:test";
import assert from "node:assert/strict";
import { ThompsonBandit, sampleBeta } from "../src/intelligence/bandit.js";
import { estimateUplift, type Observation } from "../src/intelligence/uplift.js";

test("sampleBeta draws values in [0, 1]", () => {
  for (let i = 0; i < 50; i++) {
    const val = sampleBeta(2, 5);
    assert.ok(val >= 0 && val <= 1);
  }
});

test("ThompsonBandit balances exploration and updates arm posteriors", () => {
  const bandit = new ThompsonBandit(["delay_2m", "delay_15m", "delay_60m"]);
  const arm = bandit.selectArm();
  assert.ok(["delay_2m", "delay_15m", "delay_60m"].includes(arm));

  // Record 20 conversions on delay_15m
  for (let i = 0; i < 20; i++) {
    bandit.recordOutcome("delay_15m", true);
  }
  // Record 20 failures on delay_2m
  for (let i = 0; i < 20; i++) {
    bandit.recordOutcome("delay_2m", false);
  }

  const arm15 = bandit.getArm("delay_15m");
  const arm2 = bandit.getArm("delay_2m");
  assert.equal(arm15?.conversions, 20);
  assert.equal(arm2?.conversions, 0);

  // Over 100 draws, delay_15m should heavily dominate delay_2m
  let count15 = 0;
  for (let i = 0; i < 100; i++) {
    if (bandit.selectArm() === "delay_15m") count15 += 1;
  }
  assert.ok(count15 > 60);

  // State exports and loads
  const exported = bandit.exportState();
  const bandit2 = new ThompsonBandit(["delay_2m", "delay_15m", "delay_60m"]);
  bandit2.loadState(exported);
  assert.equal(bandit2.getArm("delay_15m")?.conversions, 20);
});

test("estimateUplift computes lift and applies CUPED variance reduction", () => {
  const obs: Observation[] = [];

  // 100 treated cases with ~30% conversion
  for (let i = 0; i < 100; i++) {
    const pre = Math.floor(Math.random() * 5);
    const converted = Math.random() < 0.3 ? 1 : 0;
    obs.push({ arm: "treated", outcome: converted, preCovariate: pre });
  }

  // 100 holdout cases with ~15% conversion
  for (let i = 0; i < 100; i++) {
    const pre = Math.floor(Math.random() * 5);
    const converted = Math.random() < 0.15 ? 1 : 0;
    obs.push({ arm: "holdout", outcome: converted, preCovariate: pre });
  }

  const result = estimateUplift(obs);
  assert.ok(typeof result.rawLift === "number");
  assert.ok(typeof result.cupedLift === "number");
  assert.ok(Array.isArray(result.ci95));
  assert.equal(result.ci95.length, 2);
  assert.ok(typeof result.varianceReductionPct === "number");
});
