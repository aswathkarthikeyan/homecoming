import type { EventType, TimelineEvent } from "../types.js";

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: {
    request(args: { method: string; params?: unknown }): Promise<unknown>;
    on?(event: string, listener: (...args: any[]) => void): void;
    removeListener?(event: string, listener: (...args: any[]) => void): void;
  };
}

export type EventCallback = (event: TimelineEvent) => void;

/**
 * Transparent, non-invasive Proxy wrapper for EIP-1193 providers.
 * Preserves prototype chains, EventEmitter methods, and works seamlessly with Wagmi / Viem.
 */
export function createProviderInterceptor<T extends { request(args: { method: string; params?: unknown }): Promise<unknown> }>(
  targetProvider: T,
  onEvent: EventCallback,
): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      if (prop === "request") {
        return async (args: { method: string; params?: unknown }) => {
          const startTime = Date.now();
          const method = args.method;

          // 1. Identify start event type
          let startEvent: EventType | undefined;
          if (method === "eth_requestAccounts") startEvent = "connect_requested";
          else if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") startEvent = "chain_switch_requested";
          else if (method === "eth_sendTransaction" || method === "wallet_sendCalls") startEvent = "tx_signature_requested";
          else if (method === "eth_signTypedData_v4" || method === "personal_sign") startEvent = "tx_signature_requested";

          if (startEvent) {
            onEvent({ type: startEvent, t: 0, message: `method:${method}` });
          }

          try {
            const result = await targetProvider.request(args);

            // 2. Success events
            if (method === "eth_requestAccounts") onEvent({ type: "session_approved", t: Date.now() - startTime });
            else if (method === "eth_sendTransaction" || method === "wallet_sendCalls") onEvent({ type: "tx_submitted", t: Date.now() - startTime });
            else if (method === "eth_signTypedData_v4" || method === "personal_sign") onEvent({ type: "tx_submitted", t: Date.now() - startTime, message: "signed" });

            return result;
          } catch (err: any) {
            const elapsed = Date.now() - startTime;
            const code = err?.code as number | undefined;
            const message = typeof err?.message === "string" ? err.message : String(err);

            if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") {
              onEvent({ type: "chain_switch_failed", t: elapsed, code, message });
            } else if (code === 4001 || /rejected|denied|cancelled/i.test(message)) {
              const rejectEvent = method === "eth_requestAccounts" ? "session_rejected" : "tx_rejected";
              onEvent({ type: rejectEvent, t: elapsed, code: 4001, message: "User rejected" });
            } else if (code === -32002) {
              onEvent({ type: "session_rejected", t: elapsed, code: -32002, message: "Request already pending" });
            } else if (/revert/i.test(message)) {
              onEvent({ type: "tx_reverted", t: elapsed, code, message: message.slice(0, 200) });
            } else if (/underpriced|nonce/i.test(message)) {
              onEvent({ type: "tx_dropped", t: elapsed, code, message: message.slice(0, 200) });
            } else {
              onEvent({ type: "rpc_error", t: elapsed, code, message: message.slice(0, 200) });
            }

            throw err;
          }
        };
      }

      const val = Reflect.get(target, prop, receiver);
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    },
  };

  return new Proxy(targetProvider, handler);
}

/**
 * Listens for EIP-6963 provider announcements on window and invokes callback for each discovered wallet.
 */
export function listenForEIP6963Providers(onDiscover: (detail: EIP6963ProviderDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const custom = event as CustomEvent<EIP6963ProviderDetail>;
    if (custom.detail?.info && custom.detail?.provider) {
      onDiscover(custom.detail);
    }
  };

  window.addEventListener("eip6963:announceProvider", handler);
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  return () => {
    window.removeEventListener("eip6963:announceProvider", handler);
  };
}
