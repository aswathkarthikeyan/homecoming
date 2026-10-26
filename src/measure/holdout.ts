import { createHash } from "node:crypto";

/** Deterministic assignment: the same case always lands in the same arm, with no stored state. */
export function isHoldout(caseId: string, salt: string, pct: number): boolean {
  if (pct <= 0) return false;
  const h = createHash("sha256").update(`${salt}:${caseId}`).digest();
  const u = h.readUInt32BE(0) / 0x1_0000_0000;
  return u < Math.min(pct, 0.5);
}

export interface ArmStats {
  /** Cases that were eligible and messaged. */
  treated: number;
  treatedConverted: number;
  /** Cases that were eligible but deliberately left alone. */
  holdout: number;
  holdoutConverted: number;
}

export interface LiftReport {
  treatedRate: number;
  holdoutRate: number;
  absoluteLift: number;
  relativeLift: number | null;
  ci95: [number, number];
  zScore: number;
  /** True only when the 95 percent interval excludes zero. */
  significant: boolean;
  recoveredConversions: number;
  recoveredRevenueUsd: number | null;
  warnings: string[];
}

/**
 * Recovered revenue counts only the conversions above what the holdout arm
 * achieved on its own. Users who would have come back anyway are not credited.
 * The interval is a normal approximation and is flagged when arms are small.
 */
export function computeLift(s: ArmStats, avgOrderValueUsd?: number): LiftReport {
  const warnings: string[] = [];
  const pt = s.treated > 0 ? s.treatedConverted / s.treated : 0;
  const ph = s.holdout > 0 ? s.holdoutConverted / s.holdout : 0;
  const diff = pt - ph;
  const se = Math.sqrt((s.treated > 0 ? (pt * (1 - pt)) / s.treated : 0) + (s.holdout > 0 ? (ph * (1 - ph)) / s.holdout : 0));
  const ci: [number, number] = [diff - 1.96 * se, diff + 1.96 * se];
  if (s.holdout < 30 || s.treated < 30) warnings.push("fewer than 30 cases in an arm: the interval is unreliable");
  if (s.holdout === 0) warnings.push("no holdout cases: lift cannot be measured");
  const recovered = Math.max(0, diff) * s.treated;
  return {
    treatedRate: pt,
    holdoutRate: ph,
    absoluteLift: diff,
    relativeLift: ph > 0 ? diff / ph : null,
    ci95: ci,
    zScore: se > 0 ? diff / se : 0,
    significant: se > 0 && (ci[0] > 0 || ci[1] < 0),
    recoveredConversions: recovered,
    recoveredRevenueUsd: avgOrderValueUsd !== undefined ? recovered * avgOrderValueUsd : null,
    warnings,
  };
}
