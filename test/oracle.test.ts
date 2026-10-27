import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateGasMetrics, getRecommendedRetryFee } from "../src/oracle/gas.js";

test("calculates EIP-1559 base fee and priority fee correctly", () => {
  const metrics = calculateGasMetrics({
    chainId: 1,
    rawBaseFeeWei: 25_000_000_000n,      // 25 Gwei
    rawPriorityFeeWei: 2_000_000_000n,   // 2 Gwei
    baselineGwei: 20,
  });

  assert.equal(metrics.baseFeeGwei, 25);
  assert.equal(metrics.priorityFeeGwei, 2);
  assert.equal(metrics.totalFeeGwei, 27);
  assert.equal(metrics.isShock, false);
});

test("detects gas shock when fee spikes over baseline threshold", () => {
  const shockMetrics = calculateGasMetrics({
    chainId: 1,
    rawBaseFeeWei: 80_000_000_000n,      // 80 Gwei
    rawPriorityFeeWei: 5_000_000_000n,   // 5 Gwei
    baselineGwei: 25,                    // 85 / 25 = 3.4x (> 1.8x threshold)
  });

  assert.equal(shockMetrics.isShock, true);
  assert.ok(shockMetrics.shockRatio && shockMetrics.shockRatio > 3);
});

test("accounts for L1 rollup data availability fee on L2s", () => {
  const l2Metrics = calculateGasMetrics({
    chainId: 8453,                       // Base
    rawBaseFeeWei: 50_000_000n,          // 0.05 Gwei
    rawPriorityFeeWei: 10_000_000n,      // 0.01 Gwei
    l1BaseFeeWei: 30_000_000_000n,       // 30 Gwei on L1
  });

  assert.ok(l2Metrics.l1DataFeeGwei && l2Metrics.l1DataFeeGwei > 0);
  assert.ok(l2Metrics.totalFeeGwei > l2Metrics.baseFeeGwei + l2Metrics.priorityFeeGwei);
});

test("getRecommendedRetryFee provides sensible retry limits", () => {
  const metrics = calculateGasMetrics({
    chainId: 1,
    rawBaseFeeWei: 40_000_000_000n,
    rawPriorityFeeWei: 2_000_000_000n,
    baselineGwei: 20,
  });

  const retry = getRecommendedRetryFee(metrics, 20);
  assert.equal(retry.maxFeePerGasGwei, 23); // 20 * 1.15
  assert.equal(retry.maxPriorityFeePerGasGwei, 2);
});
