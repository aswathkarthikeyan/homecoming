import type { FailureCase, TimelineEvent, EventType } from "../types.js";

export function has(events: TimelineEvent[], type: EventType): boolean {
  return events.some((e) => e.type === type);
}

export function last(events: TimelineEvent[], type: EventType): TimelineEvent | undefined {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e && e.type === type) return e;
  }
  return undefined;
}

export function hasCode(events: TimelineEvent[], code: number | string): boolean {
  return events.some((e) => e.code !== undefined && String(e.code) === String(code));
}

export function gasRatio(c: FailureCase): number | undefined {
  const { gasGwei, gasBaselineGwei } = c.context;
  if (gasGwei === undefined || gasBaselineGwei === undefined || gasBaselineGwei <= 0) return undefined;
  return gasGwei / gasBaselineGwei;
}

export function messageMatches(events: TimelineEvent[], pattern: RegExp): boolean {
  return events.some((e) => e.message !== undefined && pattern.test(e.message));
}

/**
 * Discrete tokens for the statistical layer. Everything is bucketed so the model
 * stays small, inspectable and cheap to train.
 */
export function featureTokens(c: FailureCase): string[] {
  const ev = c.events;
  const tokens: string[] = [];
  const lastEvent = ev[ev.length - 1];
  tokens.push(`flow=${c.context.flow}`);
  tokens.push(`platform=${c.context.platform}`);
  tokens.push(`inapp=${c.context.inAppBrowser ? 1 : 0}`);
  tokens.push(`last=${lastEvent ? lastEvent.type : "none"}`);
  for (const type of new Set(ev.map((e) => e.type))) tokens.push(`saw=${type}`);
  for (const code of new Set(ev.filter((e) => e.code !== undefined).map((e) => String(e.code)))) {
    tokens.push(`code=${code}`);
  }
  const gr = gasRatio(c);
  tokens.push(`gas=${gr === undefined ? "na" : gr >= 3 ? "extreme" : gr >= 1.8 ? "high" : gr >= 1.2 ? "elevated" : "normal"}`);
  tokens.push(`balance=${c.context.balanceSufficient === undefined ? "na" : c.context.balanceSufficient ? "ok" : "low"}`);
  const same =
    c.context.chainId !== undefined && c.context.targetChainId !== undefined
      ? c.context.chainId === c.context.targetChainId
      : undefined;
  tokens.push(`chain=${same === undefined ? "na" : same ? "match" : "mismatch"}`);
  const rpc = c.context.rpcLatencyMs;
  tokens.push(`rpc=${rpc === undefined ? "na" : rpc > 4000 ? "slow" : rpc > 1500 ? "sluggish" : "ok"}`);
  const dwell = lastEvent ? lastEvent.t : 0;
  tokens.push(`dwell=${dwell > 60000 ? "long" : dwell > 15000 ? "medium" : "short"}`);
  return tokens;
}
