/**
 * Universal EVM ABI Revert and 4-Byte Custom Error Decoder.
 * Decodes standard Solidity errors, custom errors, and ERC-4337 error codes
 * from raw hex payloads without requiring external network dependencies.
 */

export interface DecodedError {
  selector: string;
  name: string;
  signature?: string;
  protocol?: string;
  message: string;
  params?: Record<string, unknown>;
  category: "slippage" | "allowance" | "funds" | "supply_or_access" | "account_abstraction" | "panic" | "execution" | "unknown";
}

/** Standard Panic code descriptions (Solidity >= 0.8.0) */
export const PANIC_CODES: Record<number, string> = {
  0x00: "Generic compiler panic",
  0x01: "Assert evaluated to false",
  0x11: "Arithmetic operation underflowed or overflowed",
  0x12: "Division or modulo by zero",
  0x21: "Conversion into an out-of-bounds enum",
  0x22: "Access to out-of-bounds storage byte array",
  0x31: "Pop on empty array",
  0x32: "Out-of-bounds array index access",
  0x41: "Too much memory allocated or memory expansion overflow",
  0x51: "Called zero-initialized variable of internal function type",
};

/** Well-known 4-byte error selectors from industry standard protocols */
export const SELECTOR_CATALOG: Record<string, { name: string; signature: string; protocol: string; category: DecodedError["category"] }> = {
  // Standard EVM / Solidity
  "0x08c379a0": { name: "Error", signature: "Error(string)", protocol: "Solidity", category: "execution" },
  "0x4e487b71": { name: "Panic", signature: "Panic(uint256)", protocol: "Solidity", category: "panic" },

  // OpenZeppelin ERC20 / Ownable / Pausable
  "0xe450d38c": { name: "ERC20InsufficientBalance", signature: "ERC20InsufficientBalance(address,uint256,uint256)", protocol: "OpenZeppelin", category: "funds" },
  "0xfb8f41b2": { name: "ERC20InsufficientAllowance", signature: "ERC20InsufficientAllowance(address,uint256,uint256)", protocol: "OpenZeppelin", category: "allowance" },
  "0xec442f05": { name: "ERC20InvalidApprover", signature: "ERC20InvalidApprover(address)", protocol: "OpenZeppelin", category: "allowance" },
  "0x96c6fd1e": { name: "ERC20InvalidReceiver", signature: "ERC20InvalidReceiver(address)", protocol: "OpenZeppelin", category: "execution" },
  "0xd93c0665": { name: "EnforcedPause", signature: "EnforcedPause()", protocol: "OpenZeppelin", category: "supply_or_access" },
  "0x118cdaa7": { name: "OwnableUnauthorizedAccount", signature: "OwnableUnauthorizedAccount(address)", protocol: "OpenZeppelin", category: "supply_or_access" },

  // Uniswap V2 / V3 / V4 & Permit2
  "0xd92e233d": { name: "UniswapV3InvalidSlippage", signature: "UniswapV3InvalidSlippage(uint256,uint256)", protocol: "Uniswap", category: "slippage" },
  "0x203d82d8": { name: "PriceSlippageExceeded", signature: "PriceSlippageExceeded(uint160,uint160)", protocol: "Uniswap", category: "slippage" },
  "0xcd69d803": { name: "SignatureExpired", signature: "SignatureExpired(uint256)", protocol: "Permit2", category: "slippage" },
  "0x8baa579f": { name: "InvalidContractSignature", signature: "InvalidContractSignature()", protocol: "Permit2", category: "execution" },
  "0x70f443e1": { name: "InvalidNonce", signature: "InvalidNonce()", protocol: "Permit2", category: "execution" },
  "0x90b98a11": { name: "TransferFailed", signature: "TransferFailed()", protocol: "Uniswap", category: "funds" },
  "0x0dcab713": { name: "NotApproved", signature: "NotApproved()", protocol: "Uniswap", category: "allowance" },

  // ERC-2612 Permit
  "0xdd4b182f": { name: "ERC2612ExpiredSignature", signature: "ERC2612ExpiredSignature(uint256)", protocol: "ERC2612", category: "slippage" },
  "0x5bfb434a": { name: "ERC2612InvalidSigner", signature: "ERC2612InvalidSigner(address,address)", protocol: "ERC2612", category: "execution" },

  // Seaport / OpenSea
  "0x81156a46": { name: "InvalidTime", signature: "InvalidTime(uint256,uint256)", protocol: "Seaport", category: "slippage" },
  "0x9484b3e8": { name: "OrderIsCancelled", signature: "OrderIsCancelled(bytes32)", protocol: "Seaport", category: "supply_or_access" },
  "0xba1ff909": { name: "OrderPartiallyFilled", signature: "OrderPartiallyFilled(bytes32)", protocol: "Seaport", category: "supply_or_access" },
};

/** ERC-4337 Account Abstraction EntryPoint Revert Codes */
export const ERC4337_ERROR_CODES: Record<string, { name: string; message: string; category: DecodedError["category"] }> = {
  AA10: { name: "SenderAlreadyConstructed", message: "Account initCode failed: sender already constructed", category: "account_abstraction" },
  AA13: { name: "InitCodeFailedOrReverted", message: "Account initCode failed or reverted during deployment", category: "account_abstraction" },
  AA20: { name: "AccountNotDeployed", message: "Account not deployed and no initCode provided in UserOp", category: "account_abstraction" },
  AA21: { name: "AccountInsufficientBalance", message: "Account has insufficient balance to pay for UserOp gas", category: "funds" },
  AA22: { name: "ExpiredOrNotDue", message: "UserOp validation failed: signature expired or not yet valid", category: "slippage" },
  AA23: { name: "Reverted", message: "Account validateUserOp function reverted", category: "execution" },
  AA24: { name: "SignatureError", message: "Account signature validation failed", category: "execution" },
  AA30: { name: "PaymasterDepositTooLow", message: "Paymaster deposit in EntryPoint too low for gas execution", category: "funds" },
  AA31: { name: "PaymasterInsufficientBalance", message: "Paymaster lacks sufficient deposit to sponsor gas", category: "funds" },
  AA32: { name: "PaymasterExpiredOrNotDue", message: "Paymaster validation failed: timestamp expired", category: "slippage" },
  AA33: { name: "PaymasterReverted", message: "Paymaster validatePaymasterUserOp function reverted", category: "account_abstraction" },
  AA34: { name: "PaymasterSignatureError", message: "Paymaster signature verification failed", category: "account_abstraction" },
};

/**
 * Decodes ABI-encoded string returned by Error(string) (selector 0x08c379a0).
 */
export function decodeAbiString(hexData: string): string | null {
  const clean = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
  if (clean.length < 136) return null; // 4 bytes selector + 32 bytes offset + 32 bytes length + string
  try {
    const lengthHex = clean.slice(72, 136);
    const length = parseInt(lengthHex, 16);
    if (isNaN(length) || length <= 0 || length > 4096) return null;
    const strHex = clean.slice(136, 136 + length * 2);
    return Buffer.from(strHex, "hex").toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Decodes ABI-encoded uint256 returned by Panic(uint256) (selector 0x4e487b71).
 */
export function decodePanicCode(hexData: string): number | null {
  const clean = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
  if (clean.length < 72) return null; // 4 bytes selector + 32 bytes uint
  try {
    const codeHex = clean.slice(8, 72);
    return parseInt(codeHex, 16);
  } catch {
    return null;
  }
}

/**
 * Attempts to extract raw hex revert data from varied RPC error representations.
 */
export function extractHexData(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") {
    const match = error.match(/0x[a-fA-F0-9]{8,}/);
    return match ? match[0].toLowerCase() : null;
  }
  const anyErr = error as any;
  if (typeof anyErr.data === "string" && anyErr.data.startsWith("0x")) return anyErr.data.toLowerCase();
  if (typeof anyErr.error?.data === "string" && anyErr.error.data.startsWith("0x")) return anyErr.error.data.toLowerCase();
  if (typeof anyErr.data?.data === "string" && anyErr.data.data.startsWith("0x")) return anyErr.data.data.toLowerCase();
  if (typeof anyErr.message === "string") {
    const match = anyErr.message.match(/0x[a-fA-F0-9]{8,}/);
    if (match) return match[0].toLowerCase();
  }
  return null;
}

/**
 * Decodes an EVM error payload (hex or structured RPC error).
 */
export function decodeEvmError(raw: unknown): DecodedError | null {
  const hex = extractHexData(raw);

  // Check for ERC-4337 Error Codes in string messages or nested errors
  const messageStr = typeof raw === "string" ? raw : (raw as any)?.message ?? JSON.stringify(raw);
  const aaMatch = typeof messageStr === "string" ? messageStr.match(/\b(AA[0-3][0-9])\b/) : null;
  if (aaMatch && aaMatch[1] && ERC4337_ERROR_CODES[aaMatch[1]]) {
    const code = aaMatch[1];
    const spec = ERC4337_ERROR_CODES[code]!;
    return {
      selector: code,
      name: spec.name,
      protocol: "ERC-4337",
      message: spec.message,
      category: spec.category,
      params: { aaCode: code },
    };
  }

  if (!hex || hex.length < 10) return null;

  const selector = hex.slice(0, 10).toLowerCase();

  // 1. Error(string)
  if (selector === "0x08c379a0") {
    const decodedMsg = decodeAbiString(hex);
    return {
      selector,
      name: "Error",
      signature: "Error(string)",
      protocol: "Solidity",
      message: decodedMsg ?? "Custom contract revert message",
      category: categorizeMessage(decodedMsg ?? ""),
    };
  }

  // 2. Panic(uint256)
  if (selector === "0x4e487b71") {
    const code = decodePanicCode(hex);
    const desc = code !== null ? PANIC_CODES[code] ?? `Panic code 0x${code.toString(16)}` : "Solidity internal panic";
    return {
      selector,
      name: "Panic",
      signature: "Panic(uint256)",
      protocol: "Solidity",
      message: desc,
      category: "panic",
      params: { panicCode: code },
    };
  }

  // 3. Known Catalog Selector
  const catalogEntry = SELECTOR_CATALOG[selector];
  if (catalogEntry) {
    return {
      selector,
      name: catalogEntry.name,
      signature: catalogEntry.signature,
      protocol: catalogEntry.protocol,
      message: `${catalogEntry.protocol} error: ${catalogEntry.name}`,
      category: catalogEntry.category,
    };
  }

  // 4. Unknown Custom 4-Byte Selector
  return {
    selector,
    name: `CustomError_${selector.slice(2)}`,
    message: `Contract reverted with unrecognized custom error selector ${selector}`,
    category: "unknown",
  };
}

function categorizeMessage(msg: string): DecodedError["category"] {
  const m = msg.toLowerCase();
  if (/slippage|price|output|deadline|expired|quote/i.test(m)) return "slippage";
  if (/insufficient|exceeds balance|funds|balance short/i.test(m)) return "funds";
  if (/allowance|approve|permit|approval/i.test(m)) return "allowance";
  if (/sold out|max supply|allowlist|whitelist|paused|not eligible/i.test(m)) return "supply_or_access";
  return "execution";
}
