import type { Eip7702Authorization } from "./types.js";

/**
 * EIP-7702: Set EOA Account Code for one or more transactions.
 * Allows regular Externally Owned Accounts (EOAs) to temporarily execute as
 * smart contract accounts with batching, sponsorship, and session keys.
 */
export const EIP7702_MAGIC_PREFIX = "0xef0100";

/**
 * Formats the 23-byte delegation bytecode placed at an EOA account during EIP-7702 execution:
 * 0xef0100 + 20-byte implementation contract address.
 */
export function formatEip7702Delegation(implementationAddress: string): string {
  const cleanAddress = implementationAddress.toLowerCase().replace(/^0x/, "");
  if (cleanAddress.length !== 40) {
    throw new Error(`Invalid address length for EIP-7702 delegation: ${implementationAddress}`);
  }
  return `${EIP7702_MAGIC_PREFIX}${cleanAddress}`;
}

/**
 * Verifies if a given account code matches an EIP-7702 delegation designator.
 */
export function isEip7702Delegated(accountCode: string): boolean {
  const clean = accountCode.toLowerCase().replace(/^0x/, "");
  return clean.startsWith("ef0100") && clean.length === 46;
}

/**
 * Extracts the smart account implementation address from an EIP-7702 delegation code.
 */
export function extractEip7702Implementation(accountCode: string): string | null {
  if (!isEip7702Delegated(accountCode)) return null;
  const clean = accountCode.toLowerCase().replace(/^0x/, "");
  return "0x" + clean.slice(6, 46);
}

/**
 * Formats an authorization tuple for inclusion in an EIP-7702 transaction wrapper.
 */
export function buildEip7702Authorization(
  auth: Eip7702Authorization
): [string, string, string, string, string, string] {
  return [
    "0x" + auth.chainId.toString(16),
    auth.address.toLowerCase(),
    "0x" + auth.nonce.toString(16),
    "0x" + auth.yParity.toString(16),
    auth.r,
    auth.s,
  ];
}
