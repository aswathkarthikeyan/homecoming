export * from "./corpus.js";
import { EVAL_CORPUS_FIXTURES } from "./corpus.js";
import type { LabeledCase } from "../../src/diagnosis/classifier.js";
import type { CauseId } from "../../src/types.js";

export function getCorpusByCause(cause: CauseId): LabeledCase[] {
  return EVAL_CORPUS_FIXTURES.filter((c) => c.label === cause);
}

export function getCorpusSample(count: number): LabeledCase[] {
  return EVAL_CORPUS_FIXTURES.slice(0, count);
}
