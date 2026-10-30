import type { CauseId, FlowContext, TimelineEvent } from "../types.js";

export interface LocalSlmConfig {
  modelId: string; // e.g. "SmolLM2-360M-Instruct-q4f16" or "Llama-3.2-1B-Instruct-q4f32"
  temperature?: number;
  maxTokens?: number;
  engine: "web_llm_wasm" | "onnx_web" | "mock_offline";
}

export interface SlmInferenceInput {
  timeline: TimelineEvent[];
  context: FlowContext;
  allowedCauses: CauseId[];
}

export interface SlmInferenceResult {
  cause: CauseId;
  confidence: number;
  rationale: string;
  source: "local_slm_offline" | "local_slm_wasm";
  latencyMs: number;
}
