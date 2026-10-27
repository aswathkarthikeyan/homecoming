export interface ProjectRecord {
  id: string;
  name: string;
  verifiedOrigin: string;
  createdAt: number;
  apiKeyHash: string;
  holdoutPercentage: number;
}

export interface CaseEntity {
  id: string;
  projectId: string;
  flow: "connect" | "purchase";
  platform: "ios" | "android" | "desktop" | "unknown";
  wallet?: string;
  chainId?: number;
  targetChainId?: number;
  cause: string;
  confidence: number;
  arm: "treated" | "holdout";
  status: "open" | "recovering" | "converted" | "dropped";
  contactHash?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimelineLogEntry {
  caseId: string;
  t: number;
  type: string;
  code?: number | string;
  message?: string;
  timestamp: number;
}
