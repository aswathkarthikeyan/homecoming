import type { ChainDefinition } from "./types.js";

/** Verified public RPCs and specs for top EVM networks */
export const VERIFIED_CHAINS: Record<number, ChainDefinition> = {
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    network: "homestead",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://cloudflare-eth.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  8453: {
    chainId: 8453,
    name: "Base",
    network: "base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org", "https://base.llamarpc.com", "https://1rpc.io/base"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.llamarpc.com"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  10: {
    chainId: 10,
    name: "OP Mainnet",
    network: "optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io", "https://optimism.llamarpc.com"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  137: {
    chainId: 137,
    name: "Polygon Mainnet",
    network: "polygon",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com", "https://polygon.llamarpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  56: {
    chainId: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org", "https://binance.llamarpc.com"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  43114: {
    chainId: 43114,
    name: "Avalanche C-Chain",
    network: "avalanche",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
  },
  324: {
    chainId: 324,
    name: "ZKsync Era",
    network: "zksync",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.era.zksync.io"],
    blockExplorerUrls: ["https://explorer.zksync.io"],
  },
};

export function getChainDefinition(chainId: number): ChainDefinition | undefined {
  return VERIFIED_CHAINS[chainId];
}

export function buildAddEthereumChainParameter(chain: ChainDefinition) {
  return {
    chainId: `0x${chain.chainId.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorerUrls: chain.blockExplorerUrls,
  };
}
