/** Shared types. Everything that crosses a module boundary lives here. */

export type Flow = "connect" | "purchase";
export type Platform = "ios" | "android" | "desktop" | "unknown";

export type EventType =
  | "connect_requested"
  | "provider_missing"
  | "deeplink_fired"
  | "wallet_opened"
  | "session_approved"
  | "session_rejected"
  | "session_timeout"
  | "chain_switch_requested"
  | "chain_switch_failed"
  | "tx_simulated"
  | "tx_signature_requested"
  | "tx_rejected"
  | "tx_submitted"
  | "tx_confirmed"
  | "tx_reverted"
  | "tx_dropped"
  | "rpc_error"
  | "security_warning_shown"
  | "page_hidden"
  | "page_visible"
  | "abandoned";

export interface TimelineEvent {
  type: EventType;
  /** Milliseconds since the flow started. */
  t: number;
  /** EIP 1193 / JSON RPC code or a short string code, when the wallet gave one. */
  code?: number | string;
  /** Raw message. Untrusted: it can come from a wallet, a contract or a page. */
  message?: string;
}

export interface FlowContext {
  flow: Flow;
  platform: Platform;
  inAppBrowser: boolean;
  /** Wallet brand as reported by the provider, for example "metamask". */
  wallet?: string;
  chainId?: number;
  targetChainId?: number;
  gasGwei?: number;
  /** Rolling baseline for the same chain, supplied by the integrator or the server. */
  gasBaselineGwei?: number;
  /** Undefined when the integrator could not check. */
  balanceSufficient?: boolean;
  rpcLatencyMs?: number;
  priceUsd?: number;
}

export interface FailureCase {
  id: string;
  projectId: string;
  context: FlowContext;
  events: TimelineEvent[];
}

export type CauseId =
  | "wallet_not_installed"
  | "deeplink_blocked"
  | "request_already_pending"
  | "wrong_network"
  | "chain_not_added"
  | "gas_shock"
  | "insufficient_funds"
  | "slippage_or_quote_expired"
  | "sold_out_or_not_eligible"
  | "rpc_failure"
  | "session_timeout"
  | "security_warning_abandon"
  | "tx_underpriced_or_dropped"
  | "user_declined"
  | "unknown";

export type DiagnosisSource = "rules" | "classifier" | "llm" | "fallback";

export interface Diagnosis {
  cause: CauseId;
  /** 0 to 1. Rules report fixed high values, the classifier a posterior, the LLM its own estimate capped by validation. */
  confidence: number;
  source: DiagnosisSource;
  /** Human readable evidence, each item should point at something in the timeline or context. */
  evidence: string[];
  alternatives: { cause: CauseId; confidence: number }[];
}

export type Channel = "telegram" | "discord" | "email" | "webhook";

export interface ContactInfo {
  channel: Channel;
  /** Opaque destination such as a Telegram chat id. Never sent to an LLM. */
  destination: string;
  /** Must be true, with a timestamp, before anything is sent. */
  consentGivenAt?: number;
}
