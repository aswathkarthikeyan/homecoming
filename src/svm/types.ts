export interface SvmInstructionError {
  programId: string;
  errorCode: number;
  hexDiscriminator?: string;
  errorName: string;
  category: "slippage" | "funds" | "compute_budget" | "account_constraint" | "program_error" | "unknown";
  description: string;
  recoverable: boolean;
  recommendedRemedy: string;
}

export interface SvmPriorityFeeEstimate {
  priorityLevel: "low" | "medium" | "high" | "turbo";
  microLamportsPerCU: number;
  jitoTipLamports: number;
  estimatedCostSol: number;
  recommendedComputeUnits: number;
}
