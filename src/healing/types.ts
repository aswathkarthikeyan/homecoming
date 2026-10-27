import type { CauseId } from "../types.js";

export type InFlightActionType =
  | "switch_chain_auto"
  | "refresh_quote_1click"
  | "fallback_rpc"
  | "sponsor_gas_paymaster"
  | "bridge_funds"
  | "cross_device_qr"
  | "focus_wallet"
  | "retry_transaction";

export interface InFlightResolution {
  type: InFlightActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  autoExecutable: boolean;
}

export interface InFlightDiagnostic {
  cause: CauseId;
  confidence: number;
  message: string;
  resolution?: InFlightResolution;
}

export interface ChainDefinition {
  chainId: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}
