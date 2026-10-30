export interface TrackedPendingTx {
  hash: string;
  chainId: number;
  from: string;
  to: string;
  nonce: number;
  valueWei: string;
  data: string;
  maxFeePerGasGwei: number;
  maxPriorityFeePerGasGwei: number;
  submittedAt: number;
  lastCheckedAt?: number;
}

export interface StagnationReport {
  hash: string;
  isStagnant: boolean;
  elapsedSeconds: number;
  currentBaseFeeGwei: number;
  txMaxFeeGwei: number;
  feeShortfallGwei: number;
  underpriced: boolean;
  recommendation: "wait" | "speed_up" | "cancel" | "mev_protect";
  reason: string;
}

export interface ReplacementTxPayload {
  action: "speed_up" | "cancel";
  chainId: number;
  from: string;
  to: string;
  nonce: number;
  value: string;
  data: string;
  maxFeePerGasGwei: number;
  maxPriorityFeePerGasGwei: number;
  gasBumpMultiplier: number;
  recommendedRpcUrl?: string;
}
