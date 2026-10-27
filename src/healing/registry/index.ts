export * from "./types.js";
export * from "./chains.js";
import { CHAINS_BY_ID, REGISTERED_CHAINS } from "./chains.js";
import type { DetailedChain } from "./types.js";

export function getChainById(chainId: number): DetailedChain | undefined {
  return CHAINS_BY_ID.get(chainId);
}

export function getMainnetChains(): DetailedChain[] {
  return REGISTERED_CHAINS.filter((c) => !c.testnet);
}

export function getTestnetChains(): DetailedChain[] {
  return REGISTERED_CHAINS.filter((c) => c.testnet);
}

export function searchChains(query: string): DetailedChain[] {
  const q = query.toLowerCase();
  return REGISTERED_CHAINS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.network.toLowerCase().includes(q) || c.id.toString() === q
  );
}
