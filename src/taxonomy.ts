import type { CauseId } from "./types.js";

export type Recoverability = "high" | "medium" | "low" | "none";

export interface CauseInfo {
  id: CauseId;
  label: string;
  description: string;
  recoverability: Recoverability;
  /** True when the failure comes from the user's own deliberate choice. */
  deliberate: boolean;
}

export const TAXONOMY: Record<CauseId, CauseInfo> = {
  wallet_not_installed: {
    id: "wallet_not_installed",
    label: "No wallet available",
    description: "The page found no injected provider and no wallet app answered.",
    recoverability: "medium",
    deliberate: false,
  },
  deeplink_blocked: {
    id: "deeplink_blocked",
    label: "Wallet never opened",
    description:
      "A deep link or WalletConnect request was fired but the wallet app never opened, common inside in app browsers and on iOS.",
    recoverability: "high",
    deliberate: false,
  },
  request_already_pending: {
    id: "request_already_pending",
    label: "Request already pending",
    description: "The wallet has an unanswered request (JSON RPC code -32002) so new ones are refused.",
    recoverability: "high",
    deliberate: false,
  },
  wrong_network: {
    id: "wrong_network",
    label: "Wrong network",
    description: "The wallet is on a different chain than the one the purchase needs.",
    recoverability: "high",
    deliberate: false,
  },
  chain_not_added: {
    id: "chain_not_added",
    label: "Network not added to wallet",
    description: "wallet_switchEthereumChain failed with 4902 because the wallet does not know the chain.",
    recoverability: "high",
    deliberate: false,
  },
  gas_shock: {
    id: "gas_shock",
    label: "Gas shock",
    description: "Network fees were far above the recent baseline when the user hesitated or left.",
    recoverability: "high",
    deliberate: false,
  },
  insufficient_funds: {
    id: "insufficient_funds",
    label: "Insufficient funds",
    description: "Balance could not cover the price plus fees.",
    recoverability: "medium",
    deliberate: false,
  },
  slippage_or_quote_expired: {
    id: "slippage_or_quote_expired",
    label: "Price moved or quote expired",
    description: "The transaction reverted or was refused because the quoted price no longer held.",
    recoverability: "high",
    deliberate: false,
  },
  sold_out_or_not_eligible: {
    id: "sold_out_or_not_eligible",
    label: "Sold out or not eligible",
    description: "The contract reverted because supply ran out, the sale is paused or the wallet is not on the allowlist.",
    recoverability: "low",
    deliberate: false,
  },
  rpc_failure: {
    id: "rpc_failure",
    label: "Node or RPC failure",
    description: "The RPC endpoint timed out, rate limited or returned server errors.",
    recoverability: "high",
    deliberate: false,
  },
  session_timeout: {
    id: "session_timeout",
    label: "Session timed out",
    description: "The wallet session or relay request expired before the user approved.",
    recoverability: "high",
    deliberate: false,
  },
  security_warning_abandon: {
    id: "security_warning_abandon",
    label: "Left after a security warning",
    description: "The wallet showed a risk warning or failed simulation and the user stopped.",
    recoverability: "low",
    deliberate: true,
  },
  tx_underpriced_or_dropped: {
    id: "tx_underpriced_or_dropped",
    label: "Underpriced or dropped",
    description: "The transaction was submitted with a fee too low, or a nonce conflict, and never confirmed.",
    recoverability: "high",
    deliberate: false,
  },
  user_declined: {
    id: "user_declined",
    label: "User declined",
    description: "The user rejected the request in the wallet with no other signal.",
    recoverability: "low",
    deliberate: true,
  },
  unknown: {
    id: "unknown",
    label: "Unknown",
    description: "No cause could be supported by the evidence.",
    recoverability: "none",
    deliberate: false,
  },
};

export const CAUSE_IDS = Object.keys(TAXONOMY) as CauseId[];

export function isCauseId(value: unknown): value is CauseId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(TAXONOMY, value);
}
