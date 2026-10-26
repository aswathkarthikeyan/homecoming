import { LlmError, postJson, type LlmProvider } from "./provider.js";

export interface GeminiOptions {
  apiKey: string;
  /** Required: model names change often, so there is no hidden default. */
  model: string;
  baseUrl?: string;
}

export function geminiProvider(opts: GeminiOptions): LlmProvider {
  const base = opts.baseUrl ?? "https://generativelanguage.googleapis.com";
  return {
    name: `gemini:${opts.model}`,
    async complete({ system, user, maxTokens, signal }) {
      const data = await postJson(
        `${base}/v1beta/models/${encodeURIComponent(opts.model)}:generateContent`,
        { "x-goog-api-key": opts.apiKey },
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: maxTokens ?? 600, responseMimeType: "application/json" },
        },
        signal,
      );
      const parts = data?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) throw new LlmError("unexpected Gemini response shape");
      return parts.map((p: any) => String(p?.text ?? "")).join("");
    },
  };
}
