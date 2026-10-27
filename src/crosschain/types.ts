/**
 * Cross-Chain Liquidity & Balance Rescue Types.
 * Powers Superpower 2: Intent-based cross-chain routing for zero-balance checkout recovery.
 */

export type BridgeProtocol = "across_v3" | "circle_cctp" | "stargate_v2" | "lifi";

export interface SupportedToken {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  addressByChain: Record<number, string>;
  priceUsd: number;
}

export interface ChainBalance {
  chainId: number;
  chainName: string;
  tokenSymbol: string;
  tokenAddress: string;
  balanceWei: string;
  balanceFormatted: number;
  balanceUsd: number;
  isNative: boolean;
}

export interface BridgeFeeBreakdown {
  relayerFeeUsd: number;
  protocolFeeUsd: number;
  destinationGasUsd: number;
  totalFeeUsd: number;
}

export interface BridgeRoute {
  id: string;
  protocol: BridgeProtocol;
  protocolName: string;
  originChainId: number;
  originChainName: string;
  targetChainId: number;
  targetChainName: string;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  inputAmount: number;
  outputAmount: number;
  fee: BridgeFeeBreakdown;
  estimatedDurationSeconds: number;
  confidence: number;
  executionPayload: {
    to: string;
    valueWei: string;
    data: string;
    chainId: number;
  };
}

export interface CrossChainRescuePlan {
  status: "surplus_found" | "deficit_unsolvable";
  userAddress: string;
  deficit: {
    chainId: number;
    chainName: string;
    tokenSymbol: string;
    neededAmount: number;
    currentBalance: number;
    shortfall: number;
    shortfallUsd: number;
  };
  recommendedRoute?: BridgeRoute;
  alternativeRoutes: BridgeRoute[];
  availableSurpluses: ChainBalance[];
}

export interface RescueQueryParams {
  userAddress: string;
  targetChainId: number;
  neededAmount: number;
  tokenSymbol?: string;
  preferredOriginChainId?: number;
}
