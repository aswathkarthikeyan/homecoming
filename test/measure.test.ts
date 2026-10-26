import test from "node:test";
import assert from "node:assert/strict";
import { computeLift, isHoldout } from "../src/measure/holdout.js";

test("holdout assignment is deterministic and close to the requested share", () => {
  assert.equal(isHoldout("a", "s", 0.1), isHoldout("a", "s", 0.1));
  let n = 0;
  for (let i = 0; i < 20000; i++) if (isHoldout(`case${i}`, "salt", 0.1)) n++;
  assert.ok(Math.abs(n / 20000 - 0.1) < 0.01, `share ${n / 20000}`);
  assert.equal(isHoldout("a", "s", 0), false);
});

test("lift credits only conversions above the holdout baseline", () => {
  const r = computeLift({ treated: 900, treatedConverted: 270, holdout: 100, holdoutConverted: 20 }, 50);
  assert.ok(Math.abs(r.treatedRate - 0.3) < 1e-9 && Math.abs(r.holdoutRate - 0.2) < 1e-9);
  assert.ok(Math.abs(r.recoveredConversions - 90) < 1e-6);
  assert.ok(Math.abs(r.recoveredRevenueUsd! - 4500) < 1e-6);
});

test("an effect inside the noise is not called significant, and small arms warn", () => {
  const r = computeLift({ treated: 40, treatedConverted: 12, holdout: 10, holdoutConverted: 3 });
  assert.equal(r.significant, false);
  assert.ok(r.warnings.length > 0);
});

test("negative lift never reports negative recovered revenue", () => {
  const r = computeLift({ treated: 500, treatedConverted: 50, holdout: 500, holdoutConverted: 100 }, 10);
  assert.equal(r.recoveredConversions, 0);
  assert.equal(r.recoveredRevenueUsd, 0);
});
