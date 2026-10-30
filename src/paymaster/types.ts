export interface PackedUserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  accountGasLimits: string; // Packed verificationGasLimit (16 bytes) and callGasLimit (16 bytes)
  preVerificationGas: string;
  gasFees: string; // Packed maxPriorityFeePerGas (16 bytes) and maxFeePerGas (16 bytes)
  paymasterAndData: string;
  signature: string;
}

export interface UserOperationV6 {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface AcceptedTokenSponsorship {
  symbol: string;
  tokenAddress: string;
  exchangeRateUsd: number;
  decimals: number;
}

export interface PaymasterPolicy {
  projectId: string;
  sponsorNativeGas: boolean;
  maxCostPerTxUsd: number;
  maxSponsorshipPerUserMonthlyUsd: number;
  allowedContractTargets: string[];
  acceptedErc20Tokens: AcceptedTokenSponsorship[];
  paymasterContractAddress: string;
}

export interface SponsorshipEvaluation {
  eligible: boolean;
  mode: "gasless_merchant_sponsored" | "erc20_token_paymaster" | "rejected";
  paymasterAddress?: string;
  paymasterAndData?: string;
  estimatedCostUsd: number;
  paymentToken?: {
    symbol: string;
    tokenAddress: string;
    requiredTokenAmount: string;
    requiredTokenFormatted: number;
  };
  reason: string;
}

export interface Eip7702Authorization {
  chainId: number;
  address: string;
  nonce: number;
  yParity: number;
  r: string;
  s: string;
}
