import type { CauseId } from "../types.js";
import { decodeEvmError, type DecodedError } from "./abi.js";
import { normalizeWalletError, type NormalizedWalletError } from "./wallets.js";

export * from "./abi.js";
export * from "./wallets.js";

export interface DiagnosticResult {
  cause: CauseId;
  confidence: number;
  evidence: string[];
  decoded?: DecodedError;
  walletError?: NormalizedWalletError;
  actionableRemedy?: string;
}

/**
 * Unified diagnostic triage on raw exceptions or RPC error blobs.
 */
export function diagnoseRawError(err: unknown, walletHint?: string): DiagnosticResult {
  const decoded = decodeEvmError(err);
  const walletNorm = normalizeWalletError(err, walletHint);

  if (decoded) {
    switch (decoded.category) {
      case "slippage":
        return {
          cause: "slippage_or_quote_expired",
          confidence: 0.98,
          evidence: [`Decoded contract error ${decoded.name} (${decoded.selector}): ${decoded.message}`],
          decoded,
          walletError: walletNorm,
          actionableRemedy: "Refresh pricing quote and allow dynamic slippage tolerance.",
        };
      case "funds":
        return {
          cause: "insufficient_funds",
          confidence: 0.98,
          evidence: [`Decoded contract error ${decoded.name} (${decoded.selector}): ${decoded.message}`],
          decoded,
          walletError: walletNorm,
          actionableRemedy: "Notify user to top up token/gas balance or suggest an on-ramp bridge.",
        };
      case "supply_or_access":
        return {
          cause: "sold_out_or_not_eligible",
          confidence: 0.96,
          evidence: [`Decoded contract error ${decoded.name} (${decoded.selector}): ${decoded.message}`],
          decoded,
          walletError: walletNorm,
          actionableRemedy: "Display allowlist eligibility check or waitlist notification.",
        };
      case "account_abstraction":
        return {
          cause: "rpc_failure",
          confidence: 0.92,
          evidence: [`ERC-4337 EntryPoint revert: ${decoded.name} - ${decoded.message}`],
          decoded,
          walletError: walletNorm,
          actionableRemedy: "Verify paymaster balance or userOp gas limits.",
        };
      case "allowance":
        return {
          cause: "unknown",
          confidence: 0.85,
          evidence: [`Allowance check failed: ${decoded.name} (${decoded.selector})`],
          decoded,
          walletError: walletNorm,
          actionableRemedy: "Trigger an ERC-20 approval or Permit2 signature before retrying.",
        };
      default:
        break;
    }
  }

  if (walletNorm.cause === "user_rejected") {
    return {
      cause: "user_declined",
      confidence: 0.99,
      evidence: ["User explicitly rejected or cancelled the request in the wallet extension"],
      walletError: walletNorm,
    };
  }

  if (walletNorm.cause === "pending_request") {
    return {
      cause: "request_already_pending",
      confidence: 0.98,
      evidence: ["Wallet reported an existing unresolved pending request"],
      walletError: walletNorm,
      actionableRemedy: "Prompt user to focus wallet window or clear pending queue.",
    };
  }

  if (walletNorm.cause === "unsupported_chain") {
    return {
      cause: "chain_not_added",
      confidence: 0.98,
      evidence: ["Wallet does not recognize target chain ID"],
      walletError: walletNorm,
      actionableRemedy: "Execute automated wallet_addEthereumChain call.",
    };
  }

  if (walletNorm.cause === "rate_limited" || walletNorm.cause === "network_error") {
    return {
      cause: "rpc_failure",
      confidence: 0.92,
      evidence: [`RPC node failure: ${walletNorm.normalizedMessage}`],
      walletError: walletNorm,
      actionableRemedy: "Switch to fallback secondary RPC endpoint.",
    };
  }

  return {
    cause: "unknown",
    confidence: 0.1,
    evidence: ["No definitive signature identified from raw error"],
    decoded: decoded ?? undefined,
    walletError: walletNorm,
  };
}
