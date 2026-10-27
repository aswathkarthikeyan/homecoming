export type ErrorCategory =
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
