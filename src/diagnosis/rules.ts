import type { CauseId, Diagnosis, FailureCase } from "../types.js";
import { gasRatio, has, hasCode, last, messageMatches } from "./features.js";

/**
 * Layer 1: deterministic signatures. Each rule is a pure function that either
 * returns a diagnosis with evidence or null. Rules are ordered from most
 * specific to least specific and the first match wins.
 *
 * Codes referenced here come from EIP 1193 (4001 rejected, 4100 unauthorized,
 * 4900 disconnected, 4901 chain disconnected), EIP 3326 style chain switching
 * (4902 unrecognized chain) and the widespread MetaMask code -32002
 * (request already pending).
 */

type Rule = (c: FailureCase) => { cause: CauseId; confidence: number; evidence: string[] } | null;

const REVERT_SOLD_OUT = /sold ?out|max(imum)? supply|exceeds? (max|supply)|not (on )?(the )?(allow|white)list|not eligible|sale (is )?(not|in)active|paused|mint(ing)? (is )?(closed|not (open|started))/i;
const REVERT_SLIPPAGE = /slippage|price (moved|changed)|insufficient output|too little received|quote (expired|stale)|deadline|expired/i;
const INSUFFICIENT = /insufficient funds|exceeds balance|transfer amount exceeds balance|not enough/i;
const UNDERPRICED = /underpriced|replacement transaction|nonce too low|fee too low|max fee per gas less than/i;

const rules: Rule[] = [
  (c) =>
    has(c.events, "provider_missing")
      ? { cause: "wallet_not_installed", confidence: 0.97, evidence: ["provider_missing event: no injected provider and no wallet answered"] }
      : null,

  (c) =>
    hasCode(c.events, -32002)
      ? { cause: "request_already_pending", confidence: 0.98, evidence: ["JSON RPC code -32002: the wallet already has an open request"] }
      : null,

  (c) =>
    hasCode(c.events, 4902) && has(c.events, "chain_switch_failed")
      ? { cause: "chain_not_added", confidence: 0.98, evidence: ["chain_switch_failed with code 4902: wallet does not know the target chain"] }
      : null,

  (c) =>
    has(c.events, "security_warning_shown") && (has(c.events, "tx_rejected") || has(c.events, "abandoned") || has(c.events, "session_rejected"))
      ? { cause: "security_warning_abandon", confidence: 0.9, evidence: ["security_warning_shown preceded a rejection or abandonment"] }
      : null,

  (c) => {
    if (c.context.chainId === undefined || c.context.targetChainId === undefined) return null;
    if (c.context.chainId === c.context.targetChainId) return null;
    const stopped = has(c.events, "tx_rejected") || has(c.events, "abandoned") || has(c.events, "chain_switch_failed") || has(c.events, "chain_switch_requested");
    if (!stopped) return null;
    return {
      cause: "wrong_network",
      confidence: 0.9,
      evidence: [`wallet on chain ${c.context.chainId}, purchase needs ${c.context.targetChainId}`],
    };
  },

  (c) => {
    const revert = last(c.events, "tx_reverted");
    if (!revert?.message) return null;
    if (REVERT_SOLD_OUT.test(revert.message)) {
      return { cause: "sold_out_or_not_eligible", confidence: 0.93, evidence: [`revert reason matches supply or eligibility: "${truncate(revert.message)}"`] };
    }
    if (REVERT_SLIPPAGE.test(revert.message)) {
      return { cause: "slippage_or_quote_expired", confidence: 0.93, evidence: [`revert reason matches price or quote movement: "${truncate(revert.message)}"`] };
    }
    if (INSUFFICIENT.test(revert.message)) {
      return { cause: "insufficient_funds", confidence: 0.93, evidence: [`revert reason says funds are short: "${truncate(revert.message)}"`] };
    }
    return null;
  },

  (c) =>
    c.context.balanceSufficient === false && (has(c.events, "tx_rejected") || has(c.events, "abandoned") || messageMatches(c.events, INSUFFICIENT))
      ? { cause: "insufficient_funds", confidence: 0.88, evidence: ["balance check said funds are insufficient before the user stopped"] }
      : null,

  (c) =>
    messageMatches(c.events, UNDERPRICED) || has(c.events, "tx_dropped")
      ? { cause: "tx_underpriced_or_dropped", confidence: 0.9, evidence: ["fee or nonce error, or the transaction was dropped from the mempool"] }
      : null,

  (c) => {
    const rpc = has(c.events, "rpc_error");
    const slow = (c.context.rpcLatencyMs ?? 0) > 4000;
    if (rpc && (slow || !has(c.events, "tx_rejected"))) {
      return { cause: "rpc_failure", confidence: 0.88, evidence: [`rpc_error event${slow ? ` with latency ${c.context.rpcLatencyMs}ms` : ""}`] };
    }
    return null;
  },

  (c) => {
    const gr = gasRatio(c);
    if (gr === undefined || gr < 1.8) return null;
    if (!(has(c.events, "abandoned") || has(c.events, "tx_rejected"))) return null;
    if (has(c.events, "security_warning_shown")) return null;
    return {
      cause: "gas_shock",
      confidence: gr >= 3 ? 0.9 : 0.8,
      evidence: [`gas ${c.context.gasGwei} gwei is ${gr.toFixed(1)}x the recent baseline when the user left`],
    };
  },

  (c) =>
    has(c.events, "session_timeout") && has(c.events, "wallet_opened")
      ? { cause: "session_timeout", confidence: 0.88, evidence: ["wallet opened but no approval arrived before the session expired"] }
      : null,

  (c) =>
    has(c.events, "deeplink_fired") && !has(c.events, "wallet_opened") && (has(c.events, "abandoned") || has(c.events, "session_timeout") || has(c.events, "page_visible"))
      ? { cause: "deeplink_blocked", confidence: c.context.inAppBrowser ? 0.9 : 0.8, evidence: ["deep link fired but wallet_opened never followed", ...(c.context.inAppBrowser ? ["flow ran inside an in app browser"] : [])] }
      : null,

  // A bare rejection with nothing else going on is a real decision by the user.
  (c) => {
    const rejected = hasCode(c.events, 4001) || has(c.events, "tx_rejected") || has(c.events, "session_rejected");
    if (!rejected) return null;
    const noOtherSignal =
      !has(c.events, "security_warning_shown") &&
      (gasRatio(c) ?? 1) < 1.2 &&
      c.context.balanceSufficient !== false &&
      !has(c.events, "rpc_error");
    return noOtherSignal
      ? { cause: "user_declined", confidence: 0.75, evidence: ["code 4001 or rejection event with no gas, balance, network, warning or RPC signal"] }
      : null;
  },
];

function truncate(s: string, n = 80): string {
  return s.length > n ? `${s.slice(0, n)}...` : s;
}

export function runRules(c: FailureCase): Diagnosis | null {
  for (const rule of rules) {
    const hit = rule(c);
    if (hit) return { ...hit, source: "rules", alternatives: [] };
  }
  return null;
}
