import { LlmError, postJson, type LlmProvider } from "./provider.js";

export interface OpenAiCompatOptions {
  /** For example http://localhost:11434/v1 for Ollama or a vLLM server. Data never leaves your machine. */
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export function openAiCompatProvider(opts: OpenAiCompatOptions): LlmProvider {
  return {
    name: `openai-compat:${opts.model}`,
    async complete({ system, user, maxTokens, signal }) {
      const data = await postJson(
        `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`,
        opts.apiKey ? { authorization: `Bearer ${opts.apiKey}` } : {},
        {
          model: opts.model,
          max_tokens: maxTokens ?? 600,
          temperature: 0,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        },
        signal,
      );
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string") throw new LlmError("unexpected chat completions response shape");
      return text;
    },
  };
}
