import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A Resume Link reopens the exact interrupted step with the fix applied.
 * The token is signed, expires, and carries only an action and its parameters.
 * It never carries a wallet address, a contact handle or a price.
 */

export type ResumeActionType =
  | "retry"
  | "switch_chain"
  | "open_native_wallet"
  | "refresh_quote"
  | "lower_gas_retry"
  | "notify_when_available"
  | "explain_warning";

export interface ResumeAction {
  type: ResumeActionType;
  params?: Record<string, string | number>;
}

export interface ResumePayload {
  v: 1;
  p: string;
  c: string;
  a: ResumeAction;
  e: number;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function sign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createResumeToken(secret: string, payload: Omit<ResumePayload, "v">): string {
  const body = b64(JSON.stringify({ v: 1, ...payload }));
  return `${body}.${sign(secret, body)}`;
}

export type VerifyResult = { ok: true; payload: ResumePayload } | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyResumeToken(secret: string, token: string, now = Date.now()): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [body, sig] = parts as [string, string];
  const expected = sign(secret, body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" };
  let payload: ResumePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (payload.v !== 1 || typeof payload.e !== "number") return { ok: false, reason: "malformed" };
  if (now > payload.e) return { ok: false, reason: "expired" };
  return { ok: true, payload };
}

export function buildResumeUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/resume?t=${encodeURIComponent(token)}`;
}
