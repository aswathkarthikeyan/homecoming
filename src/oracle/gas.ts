/**
 * Multi-Chain Gas Oracle & L1 Rollup Data Overhead Calculator.
 * Tracks EIP-1559 base fee spikes and rollup L1 data submission fees across major networks.
 */

export interface FeeEstimate {
  chainId: number;
  baseFeeGwei: number;
  priorityFeeGwei: number;
  totalFeeGwei: number;
  l1DataFeeGwei?: number;
  timestamp: number;
  isShock: boolean;
  shockRatio?: number;
}

export interface GasOracleConfig {
  baselineGwei?: number;
  shockThresholdRatio?: number; // Default 1.8x
}

/** Rollup L1 data fee multipliers (approximate scalar weights) */
const L2_ROLLUP_CHAINS = new Set([8453, 10, 42161, 324]);

export function calculateGasMetrics(params: {
  chainId: number;
  rawBaseFeeWei: bigint | string | number;
  rawPriorityFeeWei?: bigint | string | number;
  baselineGwei?: number;
  l1BaseFeeWei?: bigint | string | number;
  shockThresholdRatio?: number;
}): FeeEstimate {
  const baseFeeWei = BigInt(params.rawBaseFeeWei);
  const priorityFeeWei = params.rawPriorityFeeWei ? BigInt(params.rawPriorityFeeWei) : 1_500_000_000n; // 1.5 Gwei default priority
  const baseFeeGwei = Number(baseFeeWei) / 1e9;
  const priorityFeeGwei = Number(priorityFeeWei) / 1e9;
  let totalFeeGwei = baseFeeGwei + priorityFeeGwei;

  let l1DataFeeGwei: number | undefined;
  if (L2_ROLLUP_CHAINS.has(params.chainId) && params.l1BaseFeeWei) {
    const l1Wei = BigInt(params.l1BaseFeeWei);
    // Estimated overhead for typical 160-byte calldata submission
    l1DataFeeGwei = (Number(l1Wei) / 1e9) * 0.05;
    totalFeeGwei += l1DataFeeGwei;
  }

  const baseline = params.baselineGwei && params.baselineGwei > 0 ? params.baselineGwei : baseFeeGwei;
  const shockRatio = baseline > 0 ? totalFeeGwei / baseline : 1;
  const threshold = params.shockThresholdRatio ?? 1.8;
  const isShock = shockRatio >= threshold;

  return {
    chainId: params.chainId,
    baseFeeGwei,
    priorityFeeGwei,
    totalFeeGwei,
    l1DataFeeGwei,
    timestamp: Date.now(),
    isShock,
    shockRatio: Math.round(shockRatio * 100) / 100,
  };
}

/**
 * Returns a recommended maximum gas limit and gas price for resubmission.
 */
export function getRecommendedRetryFee(currentFee: FeeEstimate, targetBaselineGwei?: number): { maxFeePerGasGwei: number; maxPriorityFeePerGasGwei: number } {
  const target = targetBaselineGwei ?? currentFee.baseFeeGwei;
  return {
    maxFeePerGasGwei: Math.max(1, Math.round(target * 1.15 * 10) / 10),
    maxPriorityFeePerGasGwei: Math.round(currentFee.priorityFeeGwei * 10) / 10,
  };
}
