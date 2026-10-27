import type { CauseId, FlowContext } from "../types.js";
import { getChainDefinition, buildAddEthereumChainParameter } from "./chains.js";
import type { InFlightDiagnostic, InFlightResolution } from "./types.js";

export * from "./types.js";
export * from "./chains.js";
export * from "./qr.js";

/**
 * Evaluates an in-flight failure context and produces an instant client-side resolution
 * that the front-end can execute or present to the user before they abandon the flow.
 */
export function resolveInFlight(cause: CauseId, context: FlowContext): InFlightDiagnostic {
  switch (cause) {
    case "chain_not_added": {
      const target = context.targetChainId;
      const chainDef = target ? getChainDefinition(target) : undefined;
      const resolution: InFlightResolution = chainDef
        ? {
            type: "switch_chain_auto",
            title: `Add & Switch to ${chainDef.name}`,
            description: `Your wallet doesn't have ${chainDef.name} configured. Click below to add the network automatically.`,
            payload: {
              method: "wallet_addEthereumChain",
              params: [buildAddEthereumChainParameter(chainDef)],
            },
            autoExecutable: true,
          }
        : {
            type: "switch_chain_auto",
            title: "Switch Network",
            description: `Please switch your wallet to Chain ID ${target ?? "the required network"}.`,
            payload: { chainId: target },
            autoExecutable: false,
          };

      return {
        cause,
        confidence: 0.98,
        message: "Wallet is not configured for the target network.",
        resolution,
      };
    }

    case "wrong_network": {
      const target = context.targetChainId;
      const chainDef = target ? getChainDefinition(target) : undefined;
      return {
        cause,
        confidence: 0.95,
        message: `Wallet is connected to Chain ID ${context.chainId ?? "unknown"}, but requires Chain ID ${target}.`,
        resolution: {
          type: "switch_chain_auto",
          title: `Switch to ${chainDef ? chainDef.name : `Chain ${target}`}`,
          description: "Click to approve network switch in your wallet.",
          payload: {
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${(target ?? 1).toString(16)}` }],
          },
          autoExecutable: true,
        },
      };
    }

    case "slippage_or_quote_expired": {
      return {
        cause,
        confidence: 0.96,
        message: "The price moved or the quote expired while waiting for approval.",
        resolution: {
          type: "refresh_quote_1click",
          title: "Accept Fresh Quote",
          description: "Market prices updated. Click to refresh the quote with current rates and continue.",
          payload: { action: "refresh_quote" },
          autoExecutable: false,
        },
      };
    }

    case "request_already_pending": {
      return {
        cause,
        confidence: 0.98,
        message: "A previous request is waiting in your wallet.",
        resolution: {
          type: "focus_wallet",
          title: "Open Pending Wallet Prompt",
          description: "Check your browser toolbar or mobile notifications to approve or cancel the pending prompt.",
          payload: { action: "focus_window" },
          autoExecutable: false,
        },
      };
    }

    case "rpc_failure": {
      const target = context.targetChainId ?? context.chainId;
      const chainDef = target ? getChainDefinition(target) : undefined;
      const fallbacks = chainDef ? chainDef.rpcUrls.slice(1) : [];
      return {
        cause,
        confidence: 0.9,
        message: "The RPC node encountered a rate-limit or connection drop.",
        resolution: {
          type: "fallback_rpc",
          title: "Retry via Backup RPC Node",
          description: "We detected an RPC outage. Click to switch to a secondary low-latency node.",
          payload: { fallbackRpcs: fallbacks },
          autoExecutable: true,
        },
      };
    }

    case "deeplink_blocked":
    case "wallet_not_installed": {
      return {
        cause,
        confidence: 0.92,
        message: "Wallet app could not be opened automatically.",
        resolution: {
          type: "cross_device_qr",
          title: "Scan QR Code to Continue on Mobile",
          description: "Scan with your mobile camera to open this purchase directly inside MetaMask, Coinbase, or Phantom.",
          payload: { promptHandoff: true },
          autoExecutable: false,
        },
      };
    }

    default:
      return {
        cause,
        confidence: 0.5,
        message: `Flow paused with cause: ${cause}`,
      };
  }
}
