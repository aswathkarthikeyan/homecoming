import type { CauseId } from "../types.js";
import type { ResumeAction } from "./resumeLink.js";
import type { FailureCase } from "../types.js";

/**
 * One playbook per cause. A playbook says what the Resume Link should do, how
 * long to wait, whether to wait for a condition, and what to say. Text is plain
 * on purpose: no urgency, no pressure, no request to approve anything.
 */

export interface Playbook {
  cause: CauseId;
  action: (c: FailureCase) => ResumeAction;
  /** Wait this long before the first message. */
  delayMs: number;
  /** Hold the message until this condition holds. */
  condition?: (c: FailureCase) => { type: "gas_below"; gwei: number };
  template: string;
}

const MIN = 60_000;

export const PLAYBOOKS: Partial<Record<CauseId, Playbook>> = {
  wallet_not_installed: {
    cause: "wallet_not_installed",
    action: () => ({ type: "open_native_wallet" }),
    delayMs: 10 * MIN,
    template:
      "Hi, your {{item}} on {{project}} did not go through because no wallet was found on your device. This link reopens it in a wallet app once you have one set up: {{link}}",
  },
  deeplink_blocked: {
    cause: "deeplink_blocked",
    action: () => ({ type: "open_native_wallet" }),
    delayMs: 5 * MIN,
    template:
      "Hi, your wallet did not open when you tried to connect to {{project}}. This link opens the same step directly in your wallet app instead: {{link}}",
  },
  request_already_pending: {
    cause: "request_already_pending",
    action: () => ({ type: "retry" }),
    delayMs: 2 * MIN,
    template:
      "Hi, your wallet already had an open request when you tried {{project}}, so the new one was blocked. Open your wallet and clear the pending request, then continue here: {{link}}",
  },
  wrong_network: {
    cause: "wrong_network",
    action: (c) => ({ type: "switch_chain", params: { chainId: c.context.targetChainId ?? 0 } }),
    delayMs: 5 * MIN,
    template:
      "Hi, your {{item}} on {{project}} stopped because your wallet was on a different network. This link reopens it with the right network ready to switch: {{link}}",
  },
  chain_not_added: {
    cause: "chain_not_added",
    action: (c) => ({ type: "switch_chain", params: { chainId: c.context.targetChainId ?? 0 } }),
    delayMs: 5 * MIN,
    template:
      "Hi, your wallet does not have the network {{project}} uses yet. This link walks you through adding it in one step and returns you to your {{item}}: {{link}}",
  },
  gas_shock: {
    cause: "gas_shock",
    action: () => ({ type: "lower_gas_retry" }),
    delayMs: 0,
    condition: (c) => ({ type: "gas_below", gwei: Math.max(1, Math.round((c.context.gasBaselineGwei ?? 1) * 1.3)) }),
    template:
      "Hi, network fees for your {{item}} on {{project}} have dropped back to a normal level. This link reopens it with a fresh fee estimate: {{link}}",
  },
  insufficient_funds: {
    cause: "insufficient_funds",
    action: () => ({ type: "retry" }),
    delayMs: 60 * MIN,
    template:
      "Hi, your {{item}} on {{project}} stopped because the balance in your wallet was short once fees were counted. When you are ready, this link reopens it: {{link}}",
  },
  slippage_or_quote_expired: {
    cause: "slippage_or_quote_expired",
    action: () => ({ type: "refresh_quote" }),
    delayMs: 3 * MIN,
    template:
      "Hi, the price for your {{item}} on {{project}} changed before it could finish. This link reopens it with a fresh quote so you can review the new price: {{link}}",
  },
  sold_out_or_not_eligible: {
    cause: "sold_out_or_not_eligible",
    action: () => ({ type: "notify_when_available" }),
    delayMs: 30 * MIN,
    template:
      "Hi, your {{item}} on {{project}} could not complete because it is currently unavailable for your wallet. This link lets you check eligibility and join the next release list: {{link}}",
  },
  rpc_failure: {
    cause: "rpc_failure",
    action: () => ({ type: "retry" }),
    delayMs: 10 * MIN,
    template:
      "Hi, a network connection problem on our side interrupted your {{item}} on {{project}}. It should be fixed now, and this link reopens it: {{link}}",
  },
  session_timeout: {
    cause: "session_timeout",
    action: () => ({ type: "open_native_wallet" }),
    delayMs: 5 * MIN,
    template:
      "Hi, the connection between your wallet and {{project}} timed out before you could approve it. This link starts a fresh one: {{link}}",
  },
  tx_underpriced_or_dropped: {
    cause: "tx_underpriced_or_dropped",
    action: () => ({ type: "lower_gas_retry" }),
    delayMs: 5 * MIN,
    template:
      "Hi, your {{item}} transaction on {{project}} was not picked up by the network because its fee was too low. This link reopens it with a fee that fits current conditions: {{link}}",
  },
  security_warning_abandon: {
    cause: "security_warning_abandon",
    action: () => ({ type: "explain_warning" }),
    delayMs: 60 * MIN,
    template:
      "Hi, your wallet showed a warning during your {{item}} on {{project}}. This page explains what the warning means and how to verify the official contract yourself. It does not ask you to proceed: {{link}}",
  },
};

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}
