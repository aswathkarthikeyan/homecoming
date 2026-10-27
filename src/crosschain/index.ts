export * from "./types.js";
export * from "./bridgeSpecs.js";
export * from "./encoding.js";
export * from "./scanner.js";
export * from "./router.js";

import { scanMultiChainBalances, type BalanceScannerOptions } from "./scanner.js";
import { buildCrossChainRescuePlan } from "./router.js";
import type { CrossChainRescuePlan, RescueQueryParams } from "./types.js";

export class CrossChainRescueEngine {
  constructor(private readonly scannerOpts: BalanceScannerOptions = {}) {}

  /**
   * Scans user balances across multiple chains and synthesizes an optimal
   * bridge-and-execute plan to cover target checkout deficits.
   */
  async planRescue(params: RescueQueryParams): Promise<CrossChainRescuePlan> {
    const balances = await scanMultiChainBalances(params.userAddress, this.scannerOpts);
    return buildCrossChainRescuePlan(params, balances);
  }
}
