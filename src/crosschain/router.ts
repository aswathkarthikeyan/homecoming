import type { BridgeRoute, ChainBalance, CrossChainRescuePlan, RescueQueryParams } from "./types.js";
import { ACROSS_SPOKE_POOLS, CIRCLE_CCTP_MESSENGERS, SUPPORTED_TOKENS } from "./bridgeSpecs.js";
import { getChainDefinition } from "../healing/chains.js";
import { encodeAcrossDepositV3 } from "./encoding.js";

/**
 * Computes optimal cross-chain bridge routes to rescue an insufficient funds deficit.
 */
export function buildCrossChainRescuePlan(
  params: RescueQueryParams,
  availableBalances: ChainBalance[],
): CrossChainRescuePlan {
  const tokenSymbol = params.tokenSymbol ?? "ETH";
  const tokenSpec = SUPPORTED_TOKENS[tokenSymbol] ?? SUPPORTED_TOKENS.ETH!;
  const targetChainDef = getChainDefinition(params.targetChainId);
  const targetChainName = targetChainDef?.name ?? `Chain ${params.targetChainId}`;

  // Find balance on target chain
  const targetBal = availableBalances.find(
    (b) => b.chainId === params.targetChainId && b.tokenSymbol.toUpperCase() === tokenSymbol.toUpperCase(),
  );
  const currentBalance = targetBal?.balanceFormatted ?? 0;
  const shortfall = Math.max(0, params.neededAmount - currentBalance);
  const shortfallUsd = shortfall * tokenSpec.priceUsd;

  // Filter surplus balances on other chains
  const otherChains = availableBalances.filter(
    (b) => b.chainId !== params.targetChainId && b.tokenSymbol.toUpperCase() === tokenSymbol.toUpperCase(),
  );

  const candidateRoutes: BridgeRoute[] = [];

  for (const surplus of otherChains) {
    // Check if surplus is sufficient (needed amount + ~1.5% buffer for bridging fee)
    const requiredSurplus = shortfall * 1.015;
    if (surplus.balanceFormatted < requiredSurplus) continue;

    const originChainId = surplus.chainId;
    const originChainDef = getChainDefinition(originChainId);
    const originChainName = originChainDef?.name ?? `Chain ${originChainId}`;
    const spokePoolAddress = ACROSS_SPOKE_POOLS[originChainId];
    if (!spokePoolAddress) continue;

    // Estimate bridge fee (~0.08% relayer fee + fixed gas subsidy)
    const relayerFee = Math.max(0.0001, shortfall * 0.0008);
    const relayerFeeUsd = Math.round(relayerFee * tokenSpec.priceUsd * 100) / 100;
    const destGasUsd = 0.25; // Typical L2 execution cost
    const totalFeeUsd = relayerFeeUsd + destGasUsd;

    const inputAmount = shortfall * 1.002; // slightly more to net exact target
    const outputAmount = shortfall;

    const decimals = tokenSpec.decimals;
    const inputWei = BigInt(Math.floor(inputAmount * Math.pow(10, decimals)));
    const outputWei = BigInt(Math.floor(outputAmount * Math.pow(10, decimals)));

    const originTokenAddress = tokenSpec.isNative
      ? "0x0000000000000000000000000000000000000000"
      : tokenSpec.addressByChain[originChainId] ?? "0x0000000000000000000000000000000000000000";

    const targetTokenAddress = tokenSpec.isNative
      ? "0x0000000000000000000000000000000000000000"
      : tokenSpec.addressByChain[params.targetChainId] ?? "0x0000000000000000000000000000000000000000";

    const data = encodeAcrossDepositV3({
      depositor: params.userAddress,
      recipient: params.userAddress,
      inputToken: originTokenAddress,
      outputToken: targetTokenAddress,
      inputAmount: inputWei,
      outputAmount: outputWei,
      destinationChainId: params.targetChainId,
    });

    const route: BridgeRoute = {
      id: `across_${originChainId}_to_${params.targetChainId}_${Date.now()}`,
      protocol: "across_v3",
      protocolName: "Across Protocol v3 (Fast Relayer)",
      originChainId,
      originChainName,
      targetChainId: params.targetChainId,
      targetChainName,
      inputTokenSymbol: tokenSymbol,
      outputTokenSymbol: tokenSymbol,
      inputAmount: Math.round(inputAmount * 10000) / 10000,
      outputAmount: Math.round(outputAmount * 10000) / 10000,
      fee: {
        relayerFeeUsd,
        protocolFeeUsd: 0,
        destinationGasUsd: destGasUsd,
        totalFeeUsd: Math.round(totalFeeUsd * 100) / 100,
      },
      estimatedDurationSeconds: originChainId === 1 ? 45 : 8, // L2-to-L2 is ~8s, L1-to-L2 ~45s
      confidence: 0.98,
      executionPayload: {
        to: spokePoolAddress,
        valueWei: tokenSpec.isNative ? inputWei.toString() : "0",
        data,
        chainId: originChainId,
      },
    };

    candidateRoutes.push(route);
  }

  // Sort candidate routes: preferred origin first, then lowest duration, then lowest fee
  candidateRoutes.sort((a, b) => {
    if (params.preferredOriginChainId) {
      if (a.originChainId === params.preferredOriginChainId) return -1;
      if (b.originChainId === params.preferredOriginChainId) return 1;
    }
    if (a.estimatedDurationSeconds !== b.estimatedDurationSeconds) {
      return a.estimatedDurationSeconds - b.estimatedDurationSeconds;
    }
    return a.fee.totalFeeUsd - b.fee.totalFeeUsd;
  });

  const recommendedRoute = candidateRoutes[0];

  return {
    status: recommendedRoute ? "surplus_found" : "deficit_unsolvable",
    userAddress: params.userAddress,
    deficit: {
      chainId: params.targetChainId,
      chainName: targetChainName,
      tokenSymbol,
      neededAmount: params.neededAmount,
      currentBalance,
      shortfall: Math.round(shortfall * 10000) / 10000,
      shortfallUsd: Math.round(shortfallUsd * 100) / 100,
    },
    recommendedRoute,
    alternativeRoutes: candidateRoutes.slice(1),
    availableSurpluses: otherChains,
  };
}
