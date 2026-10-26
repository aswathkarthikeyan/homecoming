import type { CauseId, Diagnosis, FailureCase } from "../types.js";
import { CAUSE_IDS } from "../taxonomy.js";
import { featureTokens } from "./features.js";

/**
 * Layer 2: multinomial naive Bayes over bucketed tokens.
 *
 * Chosen on purpose: it trains in milliseconds, the model file is readable JSON,
 * and every prediction can be explained by the tokens that moved it. It is a
 * baseline that a gradient boosted model can replace behind the same interface.
 */

export interface NaiveBayesModel {
  version: 1;
  alpha: number;
  priors: Record<string, number>;
  /** log P(token | cause) for tokens seen in training. */
  logLik: Record<string, Record<string, number>>;
  /** log P(unseen token | cause), used for smoothing. */
  logUnseen: Record<string, number>;
  trainedOn: number;
}

export interface LabeledCase {
  case: FailureCase;
  label: CauseId;
}

export function train(data: LabeledCase[], alpha = 1): NaiveBayesModel {
  const classCount: Record<string, number> = {};
  const tokenCounts: Record<string, Record<string, number>> = {};
  const totalTokens: Record<string, number> = {};
  const vocab = new Set<string>();

  for (const { case: c, label } of data) {
    classCount[label] = (classCount[label] ?? 0) + 1;
    const counts = (tokenCounts[label] ??= {});
    for (const tok of featureTokens(c)) {
      counts[tok] = (counts[tok] ?? 0) + 1;
      totalTokens[label] = (totalTokens[label] ?? 0) + 1;
      vocab.add(tok);
    }
  }

  const priors: Record<string, number> = {};
  const logLik: Record<string, Record<string, number>> = {};
  const logUnseen: Record<string, number> = {};
  const n = data.length;
  const v = vocab.size;

  for (const cause of CAUSE_IDS) {
    const cc = classCount[cause] ?? 0;
    priors[cause] = Math.log((cc + alpha) / (n + alpha * CAUSE_IDS.length));
    const denom = (totalTokens[cause] ?? 0) + alpha * (v + 1);
    logUnseen[cause] = Math.log(alpha / denom);
    const row: Record<string, number> = {};
    for (const tok of vocab) {
      row[tok] = Math.log(((tokenCounts[cause]?.[tok]) ?? 0) + alpha) - Math.log(denom);
    }
    logLik[cause] = row;
  }
  return { version: 1, alpha, priors, logLik, logUnseen, trainedOn: n };
}

export function predict(model: NaiveBayesModel, c: FailureCase): Diagnosis {
  const tokens = featureTokens(c);
  const scores: { cause: CauseId; s: number }[] = CAUSE_IDS.map((cause) => {
    let s = model.priors[cause] ?? Math.log(1e-9);
    for (const tok of tokens) s += model.logLik[cause]?.[tok] ?? model.logUnseen[cause] ?? Math.log(1e-9);
    return { cause, s };
  });
  const max = Math.max(...scores.map((x) => x.s));
  const exps = scores.map((x) => ({ cause: x.cause, p: Math.exp(x.s - max) }));
  const z = exps.reduce((a, b) => a + b.p, 0);
  const ranked = exps.map((x) => ({ cause: x.cause, confidence: x.p / z })).sort((a, b) => b.confidence - a.confidence);
  const top = ranked[0]!;
  return {
    cause: top.cause,
    confidence: top.confidence,
    source: "classifier",
    evidence: explain(model, tokens, top.cause, ranked[1]?.cause),
    alternatives: ranked.slice(1, 4),
  };
}

/** Tokens that favour the winner over the runner up the most, as readable evidence. */
function explain(model: NaiveBayesModel, tokens: string[], winner: CauseId, runnerUp?: CauseId): string[] {
  if (!runnerUp) return [];
  const deltas = tokens
    .map((tok) => ({
      tok,
      d: (model.logLik[winner]?.[tok] ?? model.logUnseen[winner] ?? 0) - (model.logLik[runnerUp]?.[tok] ?? model.logUnseen[runnerUp] ?? 0),
    }))
    .filter((x) => x.d > 0.5)
    .sort((a, b) => b.d - a.d)
    .slice(0, 4);
  return deltas.map((x) => `feature ${x.tok} favours ${winner} over ${runnerUp}`);
}
