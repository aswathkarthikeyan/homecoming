import type { CauseId } from "../src/types.js";
import { CAUSE_IDS } from "../src/taxonomy.js";

export interface PerCause {
  cause: CauseId;
  support: number;
  precision: number;
  recall: number;
  f1: number;
}

export function score(pairs: { truth: CauseId; pred: CauseId }[]) {
  const per: PerCause[] = CAUSE_IDS.map((cause) => {
    const tp = pairs.filter((p) => p.truth === cause && p.pred === cause).length;
    const fp = pairs.filter((p) => p.truth !== cause && p.pred === cause).length;
    const fn = pairs.filter((p) => p.truth === cause && p.pred !== cause).length;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return { cause, support: tp + fn, precision, recall, f1 };
  });
  const present = per.filter((p) => p.support > 0);
  const accuracy = pairs.filter((p) => p.truth === p.pred).length / Math.max(1, pairs.length);
  const macroF1 = present.reduce((s, p) => s + p.f1, 0) / Math.max(1, present.length);
  return { accuracy, macroF1, per };
}
