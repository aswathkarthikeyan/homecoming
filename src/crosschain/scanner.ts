import type { ChainBalance } from "./types.js";
import { SUPPORTED_TOKENS } from "./bridgeSpecs.js";
import { getChainDefinition } from "../healing/chains.js";
import { padAddress } from "./encoding.js";

export interface BalanceScannerOptions {
  chains?: number[];
  tokens?: string[];
  fetcher?: (url: string, body: unknown) => Promise<any>;
  timeoutMs?: number;
}

const DEFAULT_CHAINS = [1, 8453, 42161, 10, 137];
const DEFAULT_TOKENS = ["ETH", "USDC", "USDT"];

/**
 * Scans an account's balances across multiple EVM chains in parallel.
 */
export async function scanMultiChainBalances(
  userAddress: string,
  options: BalanceScannerOptions = {},
): Promise<ChainBalance[]> {
  const chains = options.chains ?? DEFAULT_CHAINS;
  const tokenSymbols = options.tokens ?? DEFAULT_TOKENS;
  const timeoutMs = options.timeoutMs ?? 3000;

  const fetcher =
    options.fetcher ??
    (async (url: string, body: unknown) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: ctl.signal,
        });
        return await res.json();
      } finally {
        clearTimeout(timer);
      }
    });

  const cleanAddr = userAddress.toLowerCase();
  const tasks: Promise<ChainBalance | null>[] = [];

  for (const chainId of chains) {
    const chainDef = getChainDefinition(chainId);
    if (!chainDef || chainDef.rpcUrls.length === 0) continue;
    const rpcUrl = chainDef.rpcUrls[0]!;

    // 1. Scan Native Token (ETH / POL)
    tasks.push(
      (async () => {
        try {
          const res = await fetcher(rpcUrl, {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [cleanAddr, "latest"],
          });
          const rawHex = res?.result;
          if (typeof rawHex !== "string" || !rawHex.startsWith("0x")) return null;
          const wei = BigInt(rawHex);
          const formatted = Number(wei) / 1e18;
          const price = SUPPORTED_TOKENS.ETH?.priceUsd ?? 2600.0;
          return {
            chainId,
            chainName: chainDef.name,
            tokenSymbol: chainDef.nativeCurrency.symbol,
            tokenAddress: "0x0000000000000000000000000000000000000000",
            balanceWei: wei.toString(),
            balanceFormatted: Math.round(formatted * 10000) / 10000,
            balanceUsd: Math.round(formatted * price * 100) / 100,
            isNative: true,
          };
        } catch {
          return null;
        }
      })(),
    );

    // 2. Scan ERC-20 Tokens
    for (const sym of tokenSymbols) {
      const tokenSpec = SUPPORTED_TOKENS[sym];
      if (!tokenSpec || tokenSpec.isNative) continue;
      const contractAddress = tokenSpec.addressByChain[chainId];
      if (!contractAddress) continue;

      tasks.push(
        (async () => {
          try {
            // balanceOf(address) selector 0x70a08231
            const calldata = `0x70a08231${padAddress(cleanAddr)}`;
            const res = await fetcher(rpcUrl, {
              jsonrpc: "2.0",
              id: 2,
              method: "eth_call",
              params: [{ to: contractAddress, data: calldata }, "latest"],
            });
            const rawHex = res?.result;
            if (typeof rawHex !== "string" || rawHex === "0x") return null;
            const rawVal = BigInt(rawHex);
            const formatted = Number(rawVal) / Math.pow(10, tokenSpec.decimals);
            const price = tokenSpec.priceUsd;
            return {
              chainId,
              chainName: chainDef.name,
              tokenSymbol: sym,
              tokenAddress: contractAddress,
              balanceWei: rawVal.toString(),
              balanceFormatted: Math.round(formatted * 100) / 100,
              balanceUsd: Math.round(formatted * price * 100) / 100,
              isNative: false,
            };
          } catch {
            return null;
          }
        })(),
      );
    }
  }

  const results = await Promise.all(tasks);
  return results.filter((b): b is ChainBalance => b !== null && b.balanceFormatted > 0);
}
