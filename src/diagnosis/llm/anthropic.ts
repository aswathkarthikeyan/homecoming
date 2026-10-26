import { LlmError, postJson, type LlmProvider } from "./provider.js";

export interface AnthropicOptions {
  apiKey: string;
  /** Defaults to a small fast model. Use a larger one for hard cases. */
  model?: string;
  baseUrl?: string;
}

export function anthropicProvider(opts: AnthropicOptions): LlmProvider {
  const model = opts.model ?? "claude-haiku-5-5";
  const base = opts.baseUrl ?? "https://api.anthropic.com";
  return {
    name: `anthropic:${model}`,
    async complete({ system, user, maxTokens, signal }) {
      const data = await postJson(
        `${base}/v1/messages`,
        { "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01" },
        { model, max_tokens: maxTokens ?? 600, system, messages: [{ role: "user", content: user }] },
        signal,
      );
      const parts: unknown = data?.content;
      if (!Array.isArray(parts)) throw new LlmError("unexpected Anthropic response shape");
      return parts.map((p: any) => (p?.type === "text" ? String(p.text) : "")).join("");
    },
  };
}
