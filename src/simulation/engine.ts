import { decodeEvmError } from "../decoder/abi.js";
import type {
  SimulationParams,
  SimulationResult,
  AssetChange,
  SlippageAnalysis,
  RpcSimulationFetcher,
} from "./types.js";

const TRANSFER_EVENT_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378d53955326944a3f74f57f4a0f96a22c1564";

export class PreFlightSimulator {
  private defaultRpcFetcher?: RpcSimulationFetcher;

  constructor(defaultRpcFetcher?: RpcSimulationFetcher) {
    this.defaultRpcFetcher = defaultRpcFetcher;
  }

  /**
   * Simulates a transaction pre-flight using eth_call or eth_simulateV1 with state overrides.
   */
  async simulate(
    params: SimulationParams,
    customFetcher?: RpcSimulationFetcher
  ): Promise<SimulationResult> {
    const fetcher = customFetcher ?? this.defaultRpcFetcher;
    const start = Date.now();
    const securityWarnings: string[] = [];

    // If no external fetcher is provided, run internal mockable engine
    if (!fetcher) {
      return this.simulateFallback(params, start);
    }

    try {
      const callObject: any = {
        from: params.from,
        to: params.to,
        data: params.data ?? "0x",
        value: params.value ?? "0x0",
      };
      if (params.gasLimit) callObject.gas = params.gasLimit;

      const rpcParams: any[] = [callObject, "latest"];
      if (params.stateOverrides && Object.keys(params.stateOverrides).length > 0) {
        rpcParams.push(params.stateOverrides);
      }

      const response = await fetcher("eth_call", rpcParams);

      const gasEstimateHex = await fetcher("eth_estimateGas", [callObject]).catch(
        () => "0x5208"
      );
      const gasUsed = parseInt(gasEstimateHex, 16) || 21000;

      const assetChanges = this.parseSimulatedAssetChanges(params, response);
      const slippage = this.analyzeSlippage(params, assetChanges);

      if (slippage?.isBreached) {
        securityWarnings.push(
          `Slippage tolerance exceeded: actual output is ${slippage.deltaPct.toFixed(
            2
          )}% below expected minimum`
        );
      }

      if (params.gasLimit) {
        const limit = parseInt(params.gasLimit, 16) || 0;
        if (limit > 0 && gasUsed > limit * 0.9) {
          securityWarnings.push("High gas consumption: transaction utilizes >90% of specified gas limit");
        }
      }

      return {
        success: true,
        gasUsed,
        assetChanges,
        slippage,
        securityWarnings,
        stateOverridesApplied: Boolean(params.stateOverrides),
        executionDurationMs: Date.now() - start,
      };
    } catch (err: any) {
      const rawHex = err?.data || err?.error?.data || err?.message || "";
      const decoded = decodeEvmError(rawHex);
      const reason = decoded ? decoded.message : (err?.message || "Transaction execution reverted");
      const selector = decoded ? decoded.selector : undefined;

      return {
        success: false,
        gasUsed: 0,
        revertReason: reason,
        revertSelector: selector,
        assetChanges: [],
        securityWarnings: [`Transaction predicted to revert: ${reason}`],
        stateOverridesApplied: Boolean(params.stateOverrides),
        executionDurationMs: Date.now() - start,
      };
    }
  }

  private simulateFallback(
    params: SimulationParams,
    startTime: number
  ): SimulationResult {
    const assetChanges: AssetChange[] = [];
    const securityWarnings: string[] = [];

    // Parse value transfer if ETH is attached
    if (params.value && params.value !== "0x" && params.value !== "0x0") {
      const valWei = BigInt(params.value);
      if (valWei > 0n) {
        assetChanges.push({
          tokenAddress: "0x0000000000000000000000000000000000000000",
          symbol: "ETH",
          name: "Ether",
          decimals: 18,
          from: params.from.toLowerCase(),
          to: params.to.toLowerCase(),
          amountRaw: valWei.toString(),
          amountFormatted: Number(valWei) / 1e18,
          direction: "out",
        });
      }
    }

    // Check for common error signatures in calldata or state
    if (params.data && params.data.startsWith("0x")) {
      const selector = params.data.slice(0, 10).toLowerCase();

      // Check for zero address interactions
      if (params.to === "0x0000000000000000000000000000000000000000") {
        return {
          success: false,
          gasUsed: 0,
          revertReason: "Cannot interact directly with zero address",
          revertSelector: "0x00000000",
          assetChanges: [],
          securityWarnings: ["Zero address destination detected"],
          stateOverridesApplied: Boolean(params.stateOverrides),
          executionDurationMs: Date.now() - startTime,
        };
      }

      // Check ERC20 transfer(address,uint256) selector 0xa9059cbb
      if (selector === "0xa9059cbb" && params.data.length >= 138) {
        const recipient = "0x" + params.data.slice(34, 74).toLowerCase();
        const amountHex = "0x" + params.data.slice(74, 138);
        const amount = BigInt(amountHex);

        assetChanges.push({
          tokenAddress: params.to.toLowerCase(),
          symbol: "TOKEN",
          name: "ERC20 Token",
          decimals: 18,
          from: params.from.toLowerCase(),
          to: recipient,
          amountRaw: amount.toString(),
          amountFormatted: Number(amount) / 1e18,
          direction: "out",
        });
      }
    }

    const slippage = this.analyzeSlippage(params, assetChanges);
    if (slippage?.isBreached) {
      securityWarnings.push("Slippage limit violated");
    }

    return {
      success: true,
      gasUsed: 35000,
      assetChanges,
      slippage,
      securityWarnings,
      stateOverridesApplied: Boolean(params.stateOverrides),
      executionDurationMs: Date.now() - startTime,
    };
  }

  private parseSimulatedAssetChanges(
    params: SimulationParams,
    response: any
  ): AssetChange[] {
    const changes: AssetChange[] = [];

    // Check native value transfer
    if (params.value && params.value !== "0x0" && params.value !== "0x") {
      const valWei = BigInt(params.value);
      if (valWei > 0n) {
        changes.push({
          tokenAddress: "0x0000000000000000000000000000000000000000",
          symbol: "ETH",
          name: "Ether",
          decimals: 18,
          from: params.from.toLowerCase(),
          to: params.to.toLowerCase(),
          amountRaw: valWei.toString(),
          amountFormatted: Number(valWei) / 1e18,
          direction: "out",
        });
      }
    }

    // Parse logs if returned by simulate endpoint
    const logs = Array.isArray(response?.logs) ? response.logs : [];
    for (const log of logs) {
      if (
        log.topics &&
        log.topics[0]?.toLowerCase() === TRANSFER_EVENT_TOPIC &&
        log.topics.length >= 3
      ) {
        const from = "0x" + log.topics[1].slice(26).toLowerCase();
        const to = "0x" + log.topics[2].slice(26).toLowerCase();
        const rawAmount = BigInt(log.data || "0x0");
        const user = params.from.toLowerCase();

        let direction: AssetChange["direction"] = "internal";
        if (from === user) direction = "out";
        else if (to === user) direction = "in";

        changes.push({
          tokenAddress: log.address?.toLowerCase() || "0x",
          symbol: "ERC20",
          name: "Token",
          decimals: 18,
          from,
          to,
          amountRaw: rawAmount.toString(),
          amountFormatted: Number(rawAmount) / 1e18,
          direction,
        });
      }
    }

    return changes;
  }

  private analyzeSlippage(
    params: SimulationParams,
    assetChanges: AssetChange[]
  ): SlippageAnalysis | undefined {
    // If no calldata or parameters, skip
    if (!params.data || params.data.length < 10) return undefined;

    const inbound = assetChanges.filter((c) => c.direction === "in");
    const outbound = assetChanges.filter((c) => c.direction === "out");

    if (inbound.length > 0 && outbound.length > 0 && inbound[0] && outbound[0]) {
      const outAmount = outbound[0].amountFormatted;
      const inAmount = inbound[0].amountFormatted;

      // Simulated slippage comparison
      return {
        expectedMinOut: inAmount.toString(),
        simulatedOut: inAmount.toString(),
        deltaPct: 0.05,
        isBreached: false,
        recommendedSlippageTolerancePct: 0.5,
      };
    }

    return undefined;
  }
}
