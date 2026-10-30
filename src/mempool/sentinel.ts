import type {
  TrackedPendingTx,
  StagnationReport,
  ReplacementTxPayload,
} from "./types.js";

export const MEV_PROTECT_RPCS: Record<number, string> = {
  1: "https://rpc.mevblocker.io",
  42161: "https://arb1.arbitrum.io/rpc",
  8453: "https://mainnet.base.org",
  10: "https://mainnet.optimism.io",
  137: "https://polygon-rpc.com",
};

export class TxDoctorSentinel {
  private trackedTxs = new Map<string, TrackedPendingTx>();
  private stagnationThresholdSec: number;

  constructor(options?: { stagnationThresholdSec?: number }) {
    this.stagnationThresholdSec = options?.stagnationThresholdSec ?? 45;
  }

  track(tx: TrackedPendingTx): void {
    this.trackedTxs.set(tx.hash.toLowerCase(), {
      ...tx,
      hash: tx.hash.toLowerCase(),
      from: tx.from.toLowerCase(),
      to: tx.to.toLowerCase(),
      lastCheckedAt: Date.now(),
    });
  }

  get(hash: string): TrackedPendingTx | undefined {
    return this.trackedTxs.get(hash.toLowerCase());
  }

  remove(hash: string): boolean {
    return this.trackedTxs.delete(hash.toLowerCase());
  }

  /**
   * Analyzes whether a pending transaction has stagnated in the mempool
   * due to time delays or gas price shortfall under EIP-1559 base fee spikes.
   */
  diagnoseStagnation(
    hash: string,
    currentBaseFeeGwei: number,
    nowMs = Date.now()
  ): StagnationReport {
    const tx = this.trackedTxs.get(hash.toLowerCase());
    if (!tx) {
      throw new Error(`Transaction ${hash} is not tracked by TxDoctorSentinel`);
    }

    const elapsedSeconds = Math.max(0, (nowMs - tx.submittedAt) / 1000);
    const feeShortfallGwei = currentBaseFeeGwei - tx.maxFeePerGasGwei;
    const underpriced = feeShortfallGwei > 0;
    const timeStagnant = elapsedSeconds >= this.stagnationThresholdSec;
    const isStagnant = underpriced || timeStagnant;

    let recommendation: StagnationReport["recommendation"] = "wait";
    let reason = "Transaction is healthy and pending block inclusion.";

    if (underpriced) {
      recommendation = "speed_up";
      reason = `Network base fee spiked to ${currentBaseFeeGwei.toFixed(
        1
      )} Gwei, exceeding your max fee of ${tx.maxFeePerGasGwei.toFixed(
        1
      )} Gwei. Transaction cannot confirm until fee drops or is accelerated.`;
    } else if (timeStagnant) {
      recommendation = "speed_up";
      reason = `Transaction has been pending in the mempool for ${Math.round(
        elapsedSeconds
      )}s without confirmation. Recommended to accelerate priority fee.`;
    }

    return {
      hash: tx.hash,
      isStagnant,
      elapsedSeconds,
      currentBaseFeeGwei,
      txMaxFeeGwei: tx.maxFeePerGasGwei,
      feeShortfallGwei: Math.max(0, feeShortfallGwei),
      underpriced,
      recommendation,
      reason,
    };
  }

  /**
   * Constructs an EIP-1559 replacement transaction with an appropriate gas bump
   * (minimum +12% per standard EVM replacement rules) to speed up confirmation.
   */
  buildSpeedUpPayload(
    hash: string,
    currentBaseFeeGwei: number,
    options?: { gasBumpPct?: number; useMevProtection?: boolean }
  ): ReplacementTxPayload {
    const tx = this.trackedTxs.get(hash.toLowerCase());
    if (!tx) {
      throw new Error(`Transaction ${hash} is not tracked`);
    }

    const bumpPct = options?.gasBumpPct ?? 20; // default 20% bump
    const bumpMultiplier = 1 + bumpPct / 100;

    // Must be at least 1.12x previous fee per EIP-1559 replace-by-fee rule
    const minRequiredMaxFee = tx.maxFeePerGasGwei * 1.12;
    const targetMaxFee = Math.max(
      minRequiredMaxFee,
      (currentBaseFeeGwei + tx.maxPriorityFeePerGasGwei) * bumpMultiplier
    );

    const targetPriorityFee = Math.max(
      tx.maxPriorityFeePerGasGwei * 1.12,
      tx.maxPriorityFeePerGasGwei * bumpMultiplier
    );

    const mevRpc = options?.useMevProtection
      ? MEV_PROTECT_RPCS[tx.chainId]
      : undefined;

    return {
      action: "speed_up",
      chainId: tx.chainId,
      from: tx.from,
      to: tx.to,
      nonce: tx.nonce,
      value: tx.valueWei,
      data: tx.data,
      maxFeePerGasGwei: parseFloat(targetMaxFee.toFixed(3)),
      maxPriorityFeePerGasGwei: parseFloat(targetPriorityFee.toFixed(3)),
      gasBumpMultiplier: parseFloat(bumpMultiplier.toFixed(2)),
      recommendedRpcUrl: mevRpc,
    };
  }

  /**
   * Constructs a zero-value cancellation transaction to invalidate the stuck nonce.
   */
  buildCancelPayload(
    hash: string,
    currentBaseFeeGwei: number,
    options?: { gasBumpPct?: number }
  ): ReplacementTxPayload {
    const tx = this.trackedTxs.get(hash.toLowerCase());
    if (!tx) {
      throw new Error(`Transaction ${hash} is not tracked`);
    }

    const bumpPct = options?.gasBumpPct ?? 25;
    const bumpMultiplier = 1 + bumpPct / 100;

    const minRequiredMaxFee = tx.maxFeePerGasGwei * 1.12;
    const targetMaxFee = Math.max(
      minRequiredMaxFee,
      currentBaseFeeGwei * bumpMultiplier * 1.2
    );

    const targetPriorityFee = Math.max(
      tx.maxPriorityFeePerGasGwei * 1.12,
      tx.maxPriorityFeePerGasGwei * bumpMultiplier
    );

    return {
      action: "cancel",
      chainId: tx.chainId,
      from: tx.from,
      to: tx.from, // Send 0 ETH to self
      nonce: tx.nonce,
      value: "0",
      data: "0x",
      maxFeePerGasGwei: parseFloat(targetMaxFee.toFixed(3)),
      maxPriorityFeePerGasGwei: parseFloat(targetPriorityFee.toFixed(3)),
      gasBumpMultiplier: parseFloat(bumpMultiplier.toFixed(2)),
    };
  }
}
