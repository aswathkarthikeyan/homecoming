/** Model agnostic interface. Implementations only move text, validation lives elsewhere. */
export interface LlmProvider {
  readonly name: string;
  complete(input: { system: string; user: string; maxTokens?: number; signal?: AbortSignal }): Promise<string>;
}

export class LlmError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "LlmError";
  }
}

export async function postJson(url: string, headers: Record<string, string>, body: unknown, signal?: AbortSignal): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: signal ?? null,
  });
  const text = await res.text();
  if (!res.ok) throw new LlmError(`LLM request failed with ${res.status}: ${text.slice(0, 300)}`, res.status);
  try {
    return JSON.parse(text);
  } catch {
    throw new LlmError("LLM returned a non JSON body");
  }
}
