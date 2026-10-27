/**
 * Wallet-Specific Error Normalizer.
 * Standardizes non-standard RPC errors and exception structures emitted by
 * popular Web3 browser extensions, mobile in-app browsers, and embedded wallets.
 */

export interface NormalizedWalletError {
  wallet: string;
  code?: number | string;
  originalMessage: string;
  normalizedMessage: string;
  cause: "user_rejected" | "network_error" | "unsupported_chain" | "pending_request" | "insufficient_funds" | "internal_error" | "rate_limited" | "unknown";
  isActionable: boolean;
}

export function normalizeWalletError(rawErr: unknown, walletHint?: string): NormalizedWalletError {
  const err = (typeof rawErr === "object" && rawErr !== null ? rawErr : { message: String(rawErr) }) as any;
  const message: string = typeof err.message === "string" ? err.message : JSON.stringify(err);
  const code: number | string | undefined = err.code ?? err.statusCode ?? err.error?.code;

  const wallet = detectWallet(message, walletHint);

  // EIP-1193 standard codes
  if (code === 4001 || /User rejected|User denied|rejected by user|Transaction cancelled/i.test(message)) {
    return {
      wallet,
      code: 4001,
      originalMessage: message,
      normalizedMessage: "The user declined or cancelled the request in their wallet.",
      cause: "user_rejected",
      isActionable: false,
    };
  }

  if (code === -32002 || /Already processing|already pending|pending authorization/i.test(message)) {
    return {
      wallet,
      code: -32002,
      originalMessage: message,
      normalizedMessage: "A request is already open in the wallet. Check your wallet extension or notification drawer.",
      cause: "pending_request",
      isActionable: true,
    };
  }

  if (code === 4902 || /Unrecognized chain|chain not found|Chain ID not supported/i.test(message)) {
    return {
      wallet,
      code: 4902,
      originalMessage: message,
      normalizedMessage: "Target network is not registered in the wallet.",
      cause: "unsupported_chain",
      isActionable: true,
    };
  }

  // Rate Limiting (Alchemy / Infura / QuickNode)
  if (code === 429 || /rate limit|Too many requests|throughput limit exceeded|exceeded CUPS/i.test(message)) {
    return {
      wallet,
      code: 429,
      originalMessage: message,
      normalizedMessage: "The RPC provider rate-limited this request. Automatic fallback recommended.",
      cause: "rate_limited",
      isActionable: true,
    };
  }

  // Insufficient Funds
  if (/insufficient funds|gas required exceeds allowance|balance too low/i.test(message)) {
    return {
      wallet,
      code,
      originalMessage: message,
      normalizedMessage: "Wallet balance is insufficient to cover the transaction value and network fees.",
      cause: "insufficient_funds",
      isActionable: true,
    };
  }

  // Network / Transport Failures
  if (/fetch failed|network connection lost|failed to fetch|WebSocket connection failed|timeout/i.test(message)) {
    return {
      wallet,
      code,
      originalMessage: message,
      normalizedMessage: "Connection between the dApp and RPC node timed out or was interrupted.",
      cause: "network_error",
      isActionable: true,
    };
  }

  return {
    wallet,
    code,
    originalMessage: message,
    normalizedMessage: message.slice(0, 150),
    cause: "internal_error",
    isActionable: false,
  };
}

function detectWallet(msg: string, hint?: string): string {
  if (hint) return hint.toLowerCase();
  const lower = msg.toLowerCase();
  if (lower.includes("metamask")) return "metamask";
  if (lower.includes("phantom")) return "phantom";
  if (lower.includes("rabby")) return "rabby";
  if (lower.includes("coinbase")) return "coinbase";
  if (lower.includes("rainbow")) return "rainbow";
  if (lower.includes("safe") || lower.includes("gnosis")) return "safe";
  return "generic";
}
