import type { CauseId, EventType, FailureCase, FlowContext, Platform, TimelineEvent } from "../src/types.js";
import type { LabeledCase } from "../src/diagnosis/classifier.js";

/**
 * Seeded generator of labeled failures. It is a stand in for real traffic so the
 * engine can be regression tested and compared across versions. It encodes
 * assumptions about how failures look, including deliberate noise (missing
 * codes, missing context) so that rules alone do not score perfectly.
 * Scores on this data measure consistency, not accuracy on live traffic.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEIGHTS: Record<CauseId, number> = {
  wallet_not_installed: 6,
  deeplink_blocked: 14,
  request_already_pending: 5,
  wrong_network: 12,
  chain_not_added: 5,
  gas_shock: 14,
  insufficient_funds: 9,
  slippage_or_quote_expired: 7,
  sold_out_or_not_eligible: 6,
  rpc_failure: 5,
  session_timeout: 8,
  security_warning_abandon: 4,
  tx_underpriced_or_dropped: 4,
  user_declined: 14,
  unknown: 5,
};

const WALLETS = ["metamask", "phantom", "rainbow", "coinbase", "trust", "rabby", "okx"];
const SOLD_OUT = ["Sold out", "Max supply reached", "Address not on allowlist", "Sale is not active", "Minting is paused"];
const SLIPPAGE = ["Slippage exceeded", "Price changed", "Quote expired", "Insufficient output amount", "Deadline expired"];

export function generate(n: number, seed: number): LabeledCase[] {
  const rnd = mulberry32(seed);
  const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;
  const chance = (p: number) => rnd() < p;
  const between = (a: number, b: number) => a + rnd() * (b - a);

  const causes = Object.keys(WEIGHTS) as CauseId[];
  const total = causes.reduce((s, c) => s + WEIGHTS[c], 0);
  const drawCause = (): CauseId => {
    let r = rnd() * total;
    for (const c of causes) {
      r -= WEIGHTS[c];
      if (r <= 0) return c;
    }
    return "unknown";
  };

  const out: LabeledCase[] = [];
  for (let i = 0; i < n; i++) {
    const label = drawCause();
    const platform: Platform = pick(["ios", "android", "android", "desktop", "ios"] as Platform[]);
    const mobile = platform !== "desktop";
    const target = pick([1, 8453, 137, 42161]);
    const baseline = between(4, 40);
    const ctx: FlowContext = {
      flow: label === "wallet_not_installed" || label === "deeplink_blocked" || label === "session_timeout" || label === "request_already_pending" ? "connect" : "purchase",
      platform,
      inAppBrowser: mobile && chance(0.3),
      wallet: chance(0.85) ? pick(WALLETS) : undefined as unknown as string,
      chainId: target,
      targetChainId: target,
      gasBaselineGwei: chance(0.9) ? baseline : undefined as unknown as number,
      gasGwei: baseline * between(0.8, 1.15),
      balanceSufficient: chance(0.7) ? true : (undefined as unknown as boolean),
      rpcLatencyMs: Math.round(between(150, 1200)),
    };
    for (const k of Object.keys(ctx) as (keyof FlowContext)[]) if (ctx[k] === undefined) delete ctx[k];

    let t = 0;
    const events: TimelineEvent[] = [];
    const ev = (type: EventType, gap: number, extra: Partial<TimelineEvent> = {}) => {
      t += Math.round(gap);
      events.push({ type, t, ...extra });
    };
    const keep = (p: number) => chance(p);

    switch (label) {
      case "wallet_not_installed":
        ev("connect_requested", 200);
        if (keep(0.75)) ev("provider_missing", 300);
        ctx.platform = keep(0.7) ? "desktop" : ctx.platform;
        delete ctx.wallet;
        ev("abandoned", between(2000, 12000));
        break;
      case "deeplink_blocked":
        ev("connect_requested", 200);
        ev("deeplink_fired", 400);
        ctx.inAppBrowser = keep(0.7) ? true : ctx.inAppBrowser;
        ev(keep(0.5) ? "page_visible" : "page_hidden", between(1500, 6000));
        ev(keep(0.75) ? "abandoned" : "session_timeout", between(6000, 30000));
        break;
      case "request_already_pending":
        ev("connect_requested", 200);
        ev("session_rejected", 500, keep(0.75) ? { code: -32002, message: "Request of type 'wallet_requestPermissions' already pending" } : {});
        ev("abandoned", between(15000, 70000));
        break;
      case "wrong_network":
        if (keep(0.85)) ctx.chainId = pick([1, 10, 56, 43114].filter((x) => x !== target));
        else delete ctx.chainId;
        ev("tx_signature_requested", 600);
        ev("chain_switch_requested", 800);
        ev(keep(0.6) ? "tx_rejected" : "abandoned", between(3000, 20000), keep(0.6) ? { code: 4001 } : {});
        break;
      case "chain_not_added":
        ctx.chainId = pick([1, 56].filter((x) => x !== target));
        ev("chain_switch_requested", 700);
        ev("chain_switch_failed", 600, keep(0.8) ? { code: 4902, message: "Unrecognized chain ID" } : {});
        ev("abandoned", between(3000, 15000));
        break;
      case "gas_shock": {
        const ratio = between(1.9, 6);
        if (keep(0.8)) ctx.gasGwei = (ctx.gasBaselineGwei ?? baseline) * ratio;
        else delete ctx.gasBaselineGwei;
        ev("tx_signature_requested", 700);
        if (keep(0.5)) ev("tx_rejected", between(8000, 50000), { code: 4001 });
        else ev("abandoned", between(8000, 60000));
        break;
      }
      case "insufficient_funds":
        if (keep(0.65)) ctx.balanceSufficient = false;
        ev("tx_signature_requested", 700);
        if (keep(0.5)) ev("tx_reverted", 1500, { message: "insufficient funds for gas * price + value" });
        else ev(keep(0.5) ? "tx_rejected" : "abandoned", between(4000, 30000), keep(0.5) ? { code: 4001 } : {});
        break;
      case "slippage_or_quote_expired":
        ev("tx_simulated", 500);
        ev("tx_signature_requested", between(20000, 90000));
        ev("tx_reverted", 2000, keep(0.8) ? { message: pick(SLIPPAGE) } : { message: "execution reverted" });
        break;
      case "sold_out_or_not_eligible":
        ev("tx_simulated", 500);
        ev("tx_signature_requested", between(1500, 9000));
        ev("tx_reverted", 1800, keep(0.8) ? { message: pick(SOLD_OUT) } : { message: "execution reverted" });
        break;
      case "rpc_failure":
        ctx.rpcLatencyMs = Math.round(between(2500, 9000));
        ev("connect_requested", 300);
        ev("rpc_error", 4000, keep(0.8) ? { code: -32603, message: "Internal JSON-RPC error" } : {});
        ev("abandoned", between(2000, 20000));
        break;
      case "session_timeout":
        ev("connect_requested", 200);
        ev("deeplink_fired", 400);
        if (keep(0.8)) ev("wallet_opened", 1500);
        ev("session_timeout", between(30000, 120000));
        break;
      case "security_warning_abandon":
        ev("tx_simulated", 500);
        ev("tx_signature_requested", 800);
        ev("security_warning_shown", 1200);
        if (keep(0.9)) ev("tx_rejected", between(2000, 15000), { code: 4001 });
        else ev("abandoned", between(2000, 15000));
        break;
      case "tx_underpriced_or_dropped":
        ev("tx_signature_requested", 700);
        ev("tx_submitted", 5000);
        if (keep(0.7)) ev("tx_dropped", between(60000, 300000), keep(0.5) ? { message: "replacement transaction underpriced" } : {});
        else ev("abandoned", between(90000, 300000));
        ctx.gasGwei = (ctx.gasBaselineGwei ?? baseline) * between(0.5, 0.9);
        break;
      case "user_declined":
        ev("tx_signature_requested", 700);
        ev("tx_rejected", between(2000, 25000), { code: 4001, message: "User rejected the request." });
        ctx.balanceSufficient = true;
        break;
      case "unknown":
        ev("connect_requested", 300);
        if (keep(0.5)) ev("page_hidden", between(1000, 9000));
        ev("abandoned", between(2000, 90000));
        break;
    }

    out.push({ label, case: { id: `sim_${seed}_${i}`, projectId: "sim", context: ctx, events } });
  }
  return out;
}
