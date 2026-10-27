export * from "./types.js";
export * from "./selectors.js";
import { SELECTOR_LOOKUP_MAP } from "./selectors.js";
import type { CatalogErrorItem, ErrorCategory } from "./types.js";

export function findErrorBySelector(selector: string): CatalogErrorItem | undefined {
  const clean = selector.startsWith("0x") ? selector.slice(0, 10).toLowerCase() : `0x${selector.slice(0, 8).toLowerCase()}`;
  return SELECTOR_LOOKUP_MAP.get(clean);
}

export function findErrorsByProtocol(protocol: string): CatalogErrorItem[] {
  const p = protocol.toLowerCase();
  const res: CatalogErrorItem[] = [];
  for (const item of SELECTOR_LOOKUP_MAP.values()) {
    if (item.protocol.toLowerCase() === p) res.push(item);
  }
  return res;
}

export function findErrorsByCategory(category: ErrorCategory): CatalogErrorItem[] {
  const res: CatalogErrorItem[] = [];
  for (const item of SELECTOR_LOOKUP_MAP.values()) {
    if (item.category === category) res.push(item);
  }
  return res;
}
