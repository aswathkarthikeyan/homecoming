import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

console.log("Generating Flagship enterprise modules in", ROOT);

// -------------------------------------------------------------
// 1. src/decoder/catalog/types.ts
// -------------------------------------------------------------
const catalogTypes = `export type ErrorCategory =
  | "slippage"
  | "allowance"
  | "funds"
  | "supply_or_access"
  | "account_abstraction"
  | "panic"
  | "execution"
  | "bridge"
  | "oracle"
  | "governance"
  | "unknown";

export interface CatalogErrorItem {
  selector: string;
  name: string;
  signature: string;
  protocol: string;
  category: ErrorCategory;
  description: string;
  remedy: string;
  params?: string[];
}
`;
writeFileSync(join(ROOT, "src/decoder/catalog/types.ts"), catalogTypes);

// -------------------------------------------------------------
// 2. src/healing/registry/types.ts
// -------------------------------------------------------------
const registryTypes = `export interface NativeCurrency {
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
`;
writeFileSync(join(ROOT, "src/healing/registry/types.ts"), registryTypes);

console.log("Base types generated successfully.");
