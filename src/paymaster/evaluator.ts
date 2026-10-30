import type {
  PaymasterPolicy,
  SponsorshipEvaluation,
  PackedUserOperation,
  UserOperationV6,
} from "./types.js";

export class PaymasterPolicyEngine {
  private policy: PaymasterPolicy;

  constructor(policy: PaymasterPolicy) {
    this.policy = policy;
  }

  /**
   * Evaluates if a given transaction or UserOperation qualifies for gas sponsorship.
   */
  evaluate(params: {
    userAddress: string;
    targetContract: string;
    estimatedGasUnits: number;
    gasPriceGwei: number;
    ethPriceUsd: number;
    userTokenBalances?: { tokenAddress: string; balanceFormatted: number }[];
  }): SponsorshipEvaluation {
    const {
      targetContract,
      estimatedGasUnits,
      gasPriceGwei,
      ethPriceUsd,
      userTokenBalances = [],
    } = params;

    const normalizedTarget = targetContract.toLowerCase();
    const isTargetAllowed =
      this.policy.allowedContractTargets.length === 0 ||
      this.policy.allowedContractTargets
        .map((t) => t.toLowerCase())
        .includes(normalizedTarget);

    if (!isTargetAllowed) {
      return {
        eligible: false,
        mode: "rejected",
        estimatedCostUsd: 0,
        reason: "Target contract is not whitelisted in merchant paymaster policy",
      };
    }

    // Calculate estimated transaction cost in USD
    const costEth = (estimatedGasUnits * gasPriceGwei) / 1e9;
    const costUsd = costEth * ethPriceUsd;

    // Check 1: Native Merchant Gas Sponsorship
    if (this.policy.sponsorNativeGas && costUsd <= this.policy.maxCostPerTxUsd) {
      const paymasterAndData = this.buildPaymasterData(
        this.policy.paymasterContractAddress,
        "merchant_sponsored"
      );

      return {
        eligible: true,
        mode: "gasless_merchant_sponsored",
        paymasterAddress: this.policy.paymasterContractAddress,
        paymasterAndData,
        estimatedCostUsd: costUsd,
        reason: `Transaction qualifies for 100% merchant gas sponsorship ($${costUsd.toFixed(
          3
        )} USD)`,
      };
    }

    // Check 2: ERC-20 Token Paymaster (Pay gas with USDC/USDT)
    for (const acceptedToken of this.policy.acceptedErc20Tokens) {
      const userBalance = userTokenBalances.find(
        (b) => b.tokenAddress.toLowerCase() === acceptedToken.tokenAddress.toLowerCase()
      );

      // Add 10% gas buffer for token conversion volatility
      const requiredUsd = costUsd * 1.1;
      const requiredTokens = requiredUsd / acceptedToken.exchangeRateUsd;

      if (userBalance && userBalance.balanceFormatted >= requiredTokens) {
        const rawAmount = BigInt(
          Math.ceil(requiredTokens * Math.pow(10, acceptedToken.decimals))
        ).toString();

        const paymasterAndData = this.buildPaymasterData(
          this.policy.paymasterContractAddress,
          "erc20_token",
          acceptedToken.tokenAddress
        );

        return {
          eligible: true,
          mode: "erc20_token_paymaster",
          paymasterAddress: this.policy.paymasterContractAddress,
          paymasterAndData,
          estimatedCostUsd: costUsd,
          paymentToken: {
            symbol: acceptedToken.symbol,
            tokenAddress: acceptedToken.tokenAddress,
            requiredTokenAmount: rawAmount,
            requiredTokenFormatted: requiredTokens,
          },
          reason: `Pay gas with ${requiredTokens.toFixed(2)} ${
            acceptedToken.symbol
          } via ERC-20 Paymaster`,
        };
      }
    }

    return {
      eligible: false,
      mode: "rejected",
      estimatedCostUsd: costUsd,
      reason: `Gas cost ($${costUsd.toFixed(2)} USD) exceeds max sponsorship limit ($${
        this.policy.maxCostPerTxUsd
      } USD) and user has insufficient token balances for ERC-20 Paymaster`,
    };
  }

  /**
   * Helper to encode paymasterAndData hex string for ERC-4337 UserOp.
   */
  private buildPaymasterData(
    paymasterAddress: string,
    type: "merchant_sponsored" | "erc20_token",
    tokenAddress?: string
  ): string {
    const cleanPaymaster = paymasterAddress.toLowerCase().replace(/^0x/, "");
    const flag = type === "merchant_sponsored" ? "00" : "01";
    const tokenHex = tokenAddress
      ? tokenAddress.toLowerCase().replace(/^0x/, "").padStart(64, "0")
      : "".padStart(64, "0");
    const validUntil = (Math.floor(Date.now() / 1000) + 3600)
      .toString(16)
      .padStart(16, "0");
    const validAfter = "0000000000000000";

    return `0x${cleanPaymaster}${flag}${tokenHex}${validUntil}${validAfter}`;
  }

  /**
   * Pack fields into v0.7 PackedUserOperation struct.
   */
  packUserOperation(userOp: UserOperationV6): PackedUserOperation {
    const vGas = BigInt(userOp.verificationGasLimit);
    const cGas = BigInt(userOp.callGasLimit);
    const accountGasLimits =
      "0x" +
      ((vGas << 128n) | cGas).toString(16).padStart(64, "0");

    const maxPriority = BigInt(userOp.maxPriorityFeePerGas);
    const maxFee = BigInt(userOp.maxFeePerGas);
    const gasFees =
      "0x" +
      ((maxPriority << 128n) | maxFee).toString(16).padStart(64, "0");

    return {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      accountGasLimits,
      preVerificationGas: userOp.preVerificationGas,
      gasFees,
      paymasterAndData: userOp.paymasterAndData,
      signature: userOp.signature,
    };
  }
}
