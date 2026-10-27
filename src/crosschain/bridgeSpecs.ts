import type { SupportedToken } from "./types.js";

/** Verified Across Protocol v3 SpokePool contract addresses */
export const ACROSS_SPOKE_POOLS: Record<number, string> = {
  1: "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",       // Ethereum Mainnet
  42161: "0xe35e9842fceaCA96370B73790088CC77940129a2",   // Arbitrum One
  8453: "0x09aea4b2242abC3341337E49398E6E99dd5aDE81",    // Base
  10: "0x6f26Bf09B1C792e3228e5467807a900A504c026E",      // OP Mainnet
  137: "0x9295ee1d8C5b022Be115A80DD3e85749f5bA0A57",     // Polygon Mainnet
};

/** Verified Circle CCTP TokenMessenger contract addresses */
export const CIRCLE_CCTP_MESSENGERS: Record<number, string> = {
  1: "0xbd3fa81b58ba92a82136038b25adec70f7840391",
  42161: "0x19330d10D9CcC875121526435c5970c7e28b86e0",
  8453: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
  10: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
  137: "0x9daF825773173D96470144729c48a87265934Ce5",
};

/** Standard tokens supported across cross-chain liquidity pools */
export const SUPPORTED_TOKENS: Record<string, SupportedToken> = {
  ETH: {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    isNative: true,
    priceUsd: 2600.0,
    addressByChain: {
      1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",     // WETH L1
      42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH Arb
      8453: "0x4200000000000000000000000000000000000006",  // WETH Base
      10: "0x4200000000000000000000000000000000000006",    // WETH OP
      137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",   // WETH Poly
    },
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    isNative: false,
    priceUsd: 1.0,
    addressByChain: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      10: "0x0b2C639c533313087F956A357871bC9F9A68367A",
      137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    },
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    isNative: false,
    priceUsd: 1.0,
    addressByChain: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      8453: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      10: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
  },
};
