export interface BatchCall {
  to: string;
  data?: string;
  value?: string;
}

export interface WalletSendCallsParams {
  version: string;
  from: string;
  chainId: string; // 0x-prefixed hex chain ID
  calls: BatchCall[];
  capabilities?: {
    paymasterService?: {
      url: string;
    };
    atomicRequired?: boolean;
    [key: string]: any;
  };
}

export interface CallReceipt {
  logs: any[];
  status: "0x1" | "0x0";
  blockHash: string;
  blockNumber: string;
  gasUsed: string;
  transactionHash: string;
}

export interface WalletCallsStatus {
  status: "PENDING" | "CONFIRMED";
  receipts?: CallReceipt[];
}

export interface AtomicBatchExecutionPlan {
  supported: boolean;
  rpcMethod: "wallet_sendCalls" | "sequential_fallback";
  payload: WalletSendCallsParams | BatchCall[];
  totalCalls: number;
  hasApproval: boolean;
  estimatedTotalGasUnits: number;
}
