export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface BlockExplorer {
  name: string;
  url: string;
  standard?: "EIP3091" | "none";
}

export interface ChainContracts {
  multicall3?: { address: string; blockCreated?: number };
  ensRegistry?: { address: string };
  ensUniversalResolver?: { address: string };
}

export interface DetailedChain {
  id: number;
  name: string;
  network: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: {
    default: { http: string[]; webSocket?: string[] };
    public: { http: string[]; webSocket?: string[] };
  };
  blockExplorers: {
    default: BlockExplorer;
    [key: string]: BlockExplorer;
  };
  contracts?: ChainContracts;
  testnet?: boolean;
  eip1559?: boolean;
}
