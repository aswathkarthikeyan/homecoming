import type { Diagnosis, FailureCase } from "../types.js";
import { runRules } from "./rules.js";
import { predict, type NaiveBayesModel } from "./classifier.js";
import { reason } from "./llm/reasoner.js";
import type { LlmProvider } from "./llm/provider.js";

export interface EngineOptions {
  model?: NaiveBayesModel;
  /** Used for ambiguous or novel cases only. */
  llm?: LlmProvider;
  /** Rules at or above this confidence are final. */
  ruleThreshold?: number;
  /** Classifier output at or above this is final. */
  classifierThreshold?: number;
  /** An LLM answer below this is treated as unknown. */
  llmThreshold?: number;
  llmTimeoutMs?: number;
  onLlmError?: (err: unknown) => void;
}

export function createEngine(opts: EngineOptions = {}) {
  const ruleT = opts.ruleThreshold ?? 0.85;
  const clsT = opts.classifierThreshold ?? 0.75;
  const llmT = opts.llmThreshold ?? 0.6;
  const timeout = opts.llmTimeoutMs ?? 12_000;

  return {
    async diagnose(c: FailureCase): Promise<Diagnosis> {
      const ruled = runRules(c);
      if (ruled && ruled.confidence >= ruleT) return ruled;

      const stat = opts.model ? predict(opts.model, c) : undefined;
      if (stat && stat.confidence >= clsT && stat.cause !== "unknown") {
        // A weak rule hit that agrees with the classifier is stronger than either alone.
        if (ruled && ruled.cause === stat.cause) {
          return { ...stat, confidence: Math.max(stat.confidence, ruled.confidence), evidence: [...ruled.evidence, ...stat.evidence] };
        }
        return stat;
      }

      if (opts.llm) {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), timeout);
        try {
          const out = await reason(opts.llm, c, { signal: ctl.signal });
          if (out.confidence >= llmT && out.cause !== "unknown") {
            return { ...out, alternatives: stat ? stat.alternatives : [] };
          }
        } catch (err) {
          opts.onLlmError?.(err);
        } finally {
          clearTimeout(timer);
        }
      }

      const best = ruled ?? stat;
      if (best && best.confidence >= 0.5 && best.cause !== "unknown") return { ...best, source: best.source === "rules" ? "rules" : "fallback" };
      return {
        cause: "unknown",
        confidence: best ? best.confidence : 0,
        source: "fallback",
        evidence: ["no layer produced a supported cause"],
        alternatives: stat ? [{ cause: stat.cause, confidence: stat.confidence }, ...stat.alternatives].slice(0, 3) : [],
      };
    },
  };
}
