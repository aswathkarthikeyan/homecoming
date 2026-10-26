import type { EventType, FailureCase, FlowContext, TimelineEvent } from "../types.js";

/**
 * Browser side recorder. It wraps an EIP 1193 provider, writes a timeline of what
 * happened, and posts it to your Homecoming server when the flow fails or the
 * user leaves. It records codes and short messages, never keys or signatures.
 */

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown }): Promise<unknown>;
}

export interface RecorderOptions {
  projectId: string;
  /** URL of the ingest endpoint, for example https://recover.example.xyz/v1/cases */
  endpoint: string;
  /** Public ingest key. Use a server side proxy if you do not want a key in the page. */
  apiKey?: string;
  context: Omit<FlowContext, "platform" | "inAppBrowser"> & Partial<Pick<FlowContext, "platform" | "inAppBrowser">>;
  /** Where to find the opted in contact, if the user gave one. */
  contact?: { channel: "telegram" | "discord" | "email" | "webhook"; destination: string; consentGivenAt: number };
  now?: () => number;
}

export function detectPlatform(ua: string): FlowContext["platform"] {
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return ua ? "desktop" : "unknown";
}

export function detectInAppBrowser(ua: string): boolean {
  return /MetaMaskMobile|TrustWallet|CoinbaseWallet|Phantom|imToken|TokenPocket|OKApp|FBAN|FBAV|Instagram|Telegram|Line\//i.test(ua);
}

const REJECT_CODES = new Set([4001]);

export class FlowRecorder {
  private events: TimelineEvent[] = [];
  private startedAt: number;
  private done = false;
  private sent = false;
  readonly id: string;
  private ctx: FlowContext;

  constructor(private readonly opts: RecorderOptions) {
    const now = opts.now ?? Date.now;
    this.startedAt = now();
    this.id = `${opts.projectId}_${this.startedAt.toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    this.ctx = { platform: detectPlatform(ua), inAppBrowser: detectInAppBrowser(ua), ...opts.context };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => this.mark(document.visibilityState === "hidden" ? "page_hidden" : "page_visible"));
      if (typeof window !== "undefined") window.addEventListener("pagehide", () => this.abandon());
    }
  }

  private t(): number {
    return (this.opts.now ?? Date.now)() - this.startedAt;
  }

  mark(type: EventType, extra: { code?: number | string; message?: string } = {}): void {
    if (this.done) return;
    const e: TimelineEvent = { type, t: this.t() };
    if (extra.code !== undefined) e.code = extra.code;
    if (extra.message) e.message = String(extra.message).slice(0, 200);
    this.events.push(e);
  }

  update(patch: Partial<FlowContext>): void {
    this.ctx = { ...this.ctx, ...patch };
  }

  /** Call when the flow finishes successfully. Nothing is sent. */
  success(): void {
    this.mark("tx_confirmed");
    this.done = true;
  }

  /** Wrap a provider so connect, chain switch and transaction calls are recorded automatically. */
  wrap<P extends EIP1193Provider>(provider: P): P {
    const original = provider.request.bind(provider);
    const self = this;
    provider.request = async (args) => {
      const begin: Record<string, EventType> = {
        eth_requestAccounts: "connect_requested",
        wallet_switchEthereumChain: "chain_switch_requested",
        wallet_addEthereumChain: "chain_switch_requested",
        eth_sendTransaction: "tx_signature_requested",
      };
      const start = begin[args.method];
      if (start) self.mark(start);
      try {
        const out = await original(args);
        if (args.method === "eth_requestAccounts") self.mark("session_approved");
        if (args.method === "eth_sendTransaction") self.mark("tx_submitted");
        return out;
      } catch (err: any) {
        const code = err?.code as number | undefined;
        const message = typeof err?.message === "string" ? err.message : undefined;
        const detail = { ...(code !== undefined ? { code } : {}), ...(message ? { message } : {}) };
        if (args.method === "wallet_switchEthereumChain" || args.method === "wallet_addEthereumChain") self.mark("chain_switch_failed", detail);
        else if (code !== undefined && REJECT_CODES.has(code)) self.mark(args.method === "eth_sendTransaction" ? "tx_rejected" : "session_rejected", detail);
        else if (args.method === "eth_sendTransaction" && /revert|insufficient|underpriced|nonce/i.test(message ?? "")) self.mark(/underpriced|nonce/i.test(message ?? "") ? "tx_dropped" : "tx_reverted", detail);
        else if (code === -32002) self.mark("session_rejected", detail);
        else self.mark("rpc_error", detail);
        void self.flush();
        throw err;
      }
    };
    return provider;
  }

  /** Mark the flow as abandoned if it never finished, then send. Safe to call more than once. */
  abandon(): void {
    if (this.done || this.sent) return;
    this.mark("abandoned");
    void this.flush();
  }

  snapshot(): FailureCase {
    return { id: this.id, projectId: this.opts.projectId, context: this.ctx, events: this.events };
  }

  async flush(): Promise<void> {
    if (this.sent || this.done) return;
    this.sent = true;
    const body = JSON.stringify({ case: this.snapshot(), ...(this.opts.contact ? { contact: this.opts.contact } : {}) });
    try {
      await fetch(this.opts.endpoint, {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json", ...(this.opts.apiKey ? { authorization: `Bearer ${this.opts.apiKey}` } : {}) },
        body,
      });
    } catch {
      // Diagnosis is best effort. It must never break the user's purchase flow.
    }
  }
}
