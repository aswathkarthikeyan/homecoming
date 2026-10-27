/**
 * Multi-Armed Bandit using Thompson Sampling (Beta-Bernoulli Conjugate Priors).
 * Dynamically balances exploration vs. exploitation to optimize message delay times
 * and channel selection without manual heuristics.
 */

export interface ArmState {
  id: string;
  alpha: number; // Prior/observed successes
  beta: number;  // Prior/observed failures
  pulls: number;
  conversions: number;
}

export interface BanditConfig {
  defaultPriorAlpha?: number; // Default 1
  defaultPriorBeta?: number;  // Default 1
}

/**
 * Standard Box-Muller transform for generating standard normal random numbers.
 */
function randomNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Approximate sample from Beta(alpha, beta) using Gamma distribution sampling.
 * Marsaglia and Tsang method for Gamma(d, c).
 */
function sampleGamma(shape: number): number {
  if (shape < 1) {
    const u = Math.random();
    return sampleGamma(shape + 1) * Math.pow(u, 1.0 / shape);
  }
  const d = shape - 1.0 / 3.0;
  const c = 1.0 / Math.sqrt(9.0 * d);
  while (true) {
    let z = randomNormal();
    let v = 1.0 + c * z;
    if (v <= 0) continue;
    v = v * v * v;
    let u = Math.random();
    if (u < 1.0 - 0.0331 * z * z * z * z) return d * v;
    if (Math.log(u) < 0.5 * z * z + d * (1.0 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(alpha: number, beta: number): number {
  const ga = sampleGamma(Math.max(1e-4, alpha));
  const gb = sampleGamma(Math.max(1e-4, beta));
  return ga / (ga + gb);
}

export class ThompsonBandit {
  private arms: Map<string, ArmState> = new Map();
  private defaultAlpha: number;
  private defaultBeta: number;

  constructor(armIds: string[], config: BanditConfig = {}) {
    this.defaultAlpha = config.defaultPriorAlpha ?? 1;
    this.defaultBeta = config.defaultPriorBeta ?? 1;
    for (const id of armIds) {
      this.arms.set(id, {
        id,
        alpha: this.defaultAlpha,
        beta: this.defaultBeta,
        pulls: 0,
        conversions: 0,
      });
    }
  }

  /**
   * Selects the winning arm for this round via Thompson Sampling.
   */
  selectArm(): string {
    let bestArm = "";
    let highestSample = -1;

    for (const [id, arm] of this.arms.entries()) {
      const sampledVal = sampleBeta(arm.alpha, arm.beta);
      if (sampledVal > highestSample) {
        highestSample = sampledVal;
        bestArm = id;
      }
    }

    if (bestArm) {
      const state = this.arms.get(bestArm)!;
      state.pulls += 1;
    }
    return bestArm;
  }

  /**
   * Records whether the dispatched action converted or not.
   */
  recordOutcome(armId: string, converted: boolean): void {
    const arm = this.arms.get(armId);
    if (!arm) return;
    if (converted) {
      arm.alpha += 1;
      arm.conversions += 1;
    } else {
      arm.beta += 1;
    }
  }

  getArm(armId: string): ArmState | undefined {
    return this.arms.get(armId);
  }

  getAllArms(): ArmState[] {
    return [...this.arms.values()];
  }

  exportState(): Record<string, ArmState> {
    const out: Record<string, ArmState> = {};
    for (const [k, v] of this.arms) out[k] = { ...v };
    return out;
  }

  loadState(state: Record<string, ArmState>): void {
    for (const [k, v] of Object.entries(state)) {
      this.arms.set(k, { ...v });
    }
  }
}
