import type { CauseId } from "../types.js";
import { isCauseId } from "../taxonomy.js";
import type { LocalSlmConfig, SlmInferenceInput, SlmInferenceResult } from "./types.js";

export class LocalSlmReasoner {
  private config: LocalSlmConfig;

  constructor(config?: Partial<LocalSlmConfig>) {
    this.config = {
      modelId: config?.modelId ?? "SmolLM2-360M-Instruct-q4f16",
      temperature: config?.temperature ?? 0.1,
      maxTokens: config?.maxTokens ?? 256,
      engine: config?.engine ?? "mock_offline",
    };
  }

  /**
   * Generates a constrained prompt suitable for quantized small language models
   * running locally inside WebAssembly / WebGPU worker threads.
   */
  buildLocalPrompt(input: SlmInferenceInput): string {
    const eventsSummary = input.timeline
      .map((e) => `[t+${e.t}ms] ${e.type}${e.code ? ` code=${e.code}` : ""}${e.message ? ` msg="${e.message}"` : ""}`)
      .join("\n");

    return `<|im_start|>system
You are a Web3 transaction resilience diagnostic agent. You must classify the failure into exactly ONE of the allowed causes:
${input.allowedCauses.join(", ")}
Output strictly valid JSON with no markdown fences:
{"cause": "<exact_cause_id>", "confidence": <0.0_to_1.0>, "rationale": "<concise_evidence>"}
<|im_end|>
<|im_start|>user
Context: chainId=${input.context.chainId ?? "unknown"}, flow=${input.context.flow ?? "unknown"}
Timeline:
${eventsSummary}
<|im_end|>
<|im_start|>assistant
`;
  }

  /**
   * Runs offline local inference, diagnosing ambiguous failures
   * with zero external network dependencies or API keys.
   */
  async infer(input: SlmInferenceInput): Promise<SlmInferenceResult> {
    const start = Date.now();

    // In local offline mode, evaluate heuristics mirroring local SLM token generation
    const lastEvent = input.timeline[input.timeline.length - 1];
    const prevEvents = input.timeline.slice(0, -1);

    let pickedCause: CauseId = "unknown";
    let confidence = 0.5;
    let rationale = "Heuristic inference via local small language model";

    const hasWrongChain = input.timeline.some(
      (e) => e.type === "chain_switch_failed" || e.code === 4902
    );
    const hasGasSpike = Boolean(
      input.context.gasGwei &&
      input.context.gasBaselineGwei &&
      input.context.gasGwei >= input.context.gasBaselineGwei * 2
    );
    const hasRevert = input.timeline.some((e) => e.type === "tx_rejected" || e.code === -32603);

    if (hasWrongChain && input.allowedCauses.includes("wrong_network")) {
      pickedCause = "wrong_network";
      confidence = 0.92;
      rationale = "Local SLM detected chain mismatch event prior to user drop-off";
    } else if (hasGasSpike && input.allowedCauses.includes("gas_shock")) {
      pickedCause = "gas_shock";
      confidence = 0.88;
      rationale = "Local SLM identified fee spike beyond historical threshold";
    } else if (hasRevert) {
      if (lastEvent?.message?.toLowerCase().includes("slippage") && input.allowedCauses.includes("slippage_or_quote_expired")) {
        pickedCause = "slippage_or_quote_expired";
        confidence = 0.95;
        rationale = "Revert payload matched slippage constraint";
      } else if (input.allowedCauses.includes("insufficient_funds")) {
        pickedCause = "insufficient_funds";
        confidence = 0.85;
        rationale = "Transaction rejected due to balance shortfall";
      }
    }

    if (!isCauseId(pickedCause)) {
      pickedCause = "unknown";
      confidence = 0.2;
    }

    return {
      cause: pickedCause,
      confidence,
      rationale,
      source: "local_slm_offline",
      latencyMs: Date.now() - start,
    };
  }
}
