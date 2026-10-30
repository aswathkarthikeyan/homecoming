import type { SvmPriorityFeeEstimate } from "./types.js";

export class SvmComputeBudgetOptimizer {
  /**
   * Estimates optimal micro-lamports per Compute Unit (CU) and Jito MEV tip
   * to guarantee transaction inclusion during network congestion.
   */
  static estimatePriorityFee(params: {
    recentPriorityFeeSamples?: number[];
    isCongested?: boolean;
    level?: "low" | "medium" | "high" | "turbo";
    estimatedUnits?: number;
  }): SvmPriorityFeeEstimate {
    const level = params.level ?? "medium";
    const samples = params.recentPriorityFeeSamples ?? [5000, 10000, 25000, 75000, 150000];
    const units = params.estimatedUnits ?? 300000;

    let microLamportsPerCU = 5000;
    let jitoTipLamports = 0;

    switch (level) {
      case "low":
        microLamportsPerCU = samples[0] ?? 2500;
        jitoTipLamports = 0;
        break;
      case "medium":
        microLamportsPerCU = samples[Math.floor(samples.length / 2)] ?? 25000;
        jitoTipLamports = params.isCongested ? 10000 : 0;
        break;
      case "high":
        microLamportsPerCU = samples[Math.min(samples.length - 1, 3)] ?? 75000;
        jitoTipLamports = 25000;
        break;
      case "turbo":
        microLamportsPerCU = (samples[samples.length - 1] ?? 150000) * 1.5;
        jitoTipLamports = 100000;
        break;
    }

    // Cost in SOL = (units * microLamportsPerCU / 1e6 + jitoTipLamports) / 1e9
    const cuCostLamports = (units * microLamportsPerCU) / 1000000;
    const totalLamports = cuCostLamports + jitoTipLamports;
    const estimatedCostSol = totalLamports / 1e9;

    return {
      priorityLevel: level,
      microLamportsPerCU: Math.round(microLamportsPerCU),
      jitoTipLamports,
      estimatedCostSol: parseFloat(estimatedCostSol.toFixed(7)),
      recommendedComputeUnits: units,
    };
  }
}
