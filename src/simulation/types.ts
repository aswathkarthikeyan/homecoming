export interface StateOverride {
  balance?: string;
  nonce?: number;
  code?: string;
  stateDiff?: Record<string, string>;
}

export interface SimulationParams {
  from: string;
  to: string;
  data?: string;
  value?: string;
  chainId: number;
  gasLimit?: string;
  blockNumber?: number;
  stateOverrides?: Record<string, StateOverride>;
}

export interface AssetChange {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  from: string;
  to: string;
  amountRaw: string;
  amountFormatted: number;
  direction: "in" | "out" | "internal";
}

export interface SlippageAnalysis {
  expectedMinOut?: string;
  simulatedOut?: string;
  deltaPct: number;
  isBreached: boolean;
  recommendedSlippageTolerancePct: number;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: number;
  revertReason?: string;
  revertSelector?: string;
  assetChanges: AssetChange[];
  slippage?: SlippageAnalysis;
  securityWarnings: string[];
  stateOverridesApplied: boolean;
  executionDurationMs: number;
}

export type RpcSimulationFetcher = (
  method: string,
  params: any[]
) => Promise<any>;
