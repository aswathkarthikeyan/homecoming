import { encodeErc20Approve } from "../crosschain/encoding.js";
import type {
  BatchCall,
  WalletSendCallsParams,
  AtomicBatchExecutionPlan,
} from "./types.js";

export class AtomicBatcher {
  /**
   * Builds an EIP-5792 atomic batch call combining an ERC-20 token approval
   * and the subsequent contract execution (e.g. mint, swap, purchase) into a single user signature.
   */
  static buildApprovalAndExecutionBatch(params: {
    from: string;
    chainId: number;
    tokenAddress: string;
    spender: string;
    approveAmount: bigint;
    executionCall: BatchCall;
    paymasterServiceUrl?: string;
  }): WalletSendCallsParams {
    const approveCalldata = encodeErc20Approve(params.spender, params.approveAmount);

    const calls: BatchCall[] = [
      {
        to: params.tokenAddress,
        data: approveCalldata,
        value: "0x0",
      },
      params.executionCall,
    ];

    const capabilities: Record<string, any> = {
      atomicRequired: true,
    };

    if (params.paymasterServiceUrl) {
      capabilities.paymasterService = {
        url: params.paymasterServiceUrl,
      };
    }

    return {
      version: "1.0",
      from: params.from.toLowerCase(),
      chainId: "0x" + params.chainId.toString(16),
      calls,
      capabilities,
    };
  }

  /**
   * Evaluates wallet capabilities to decide between EIP-5792 wallet_sendCalls
   * or a sequential multi-step fallback for legacy wallets.
   */
  static planExecution(
    calls: BatchCall[],
    from: string,
    chainId: number,
    walletCapabilities?: Record<string, any>
  ): AtomicBatchExecutionPlan {
    const chainHex = "0x" + chainId.toString(16);
    const chainCaps = walletCapabilities?.[chainHex] || walletCapabilities;
    const supportsAtomic = Boolean(chainCaps?.atomicBatch?.supported ?? chainCaps?.atomicRequired);

    const hasApproval = calls.some(
      (c) => c.data?.toLowerCase().startsWith("0x095ea7b3")
    );

    if (supportsAtomic) {
      return {
        supported: true,
        rpcMethod: "wallet_sendCalls",
        payload: {
          version: "1.0",
          from: from.toLowerCase(),
          chainId: chainHex,
          calls,
          capabilities: { atomicRequired: true },
        },
        totalCalls: calls.length,
        hasApproval,
        estimatedTotalGasUnits: calls.length * 65000,
      };
    }

    return {
      supported: false,
      rpcMethod: "sequential_fallback",
      payload: calls,
      totalCalls: calls.length,
      hasApproval,
      estimatedTotalGasUnits: calls.length * 85000,
    };
  }
}
