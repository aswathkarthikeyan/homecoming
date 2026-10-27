import { createHmac, timingSafeEqual } from "node:crypto";

export interface CrossDeviceSessionPayload {
  version: 1;
  sessionId: string;
  projectId: string;
  targetChainId: number;
  action: "connect" | "purchase" | "sign";
  expiresAt: number;
  contextData?: Record<string, unknown>;
}

export interface CrossDeviceHandoff {
  token: string;
  uri: string;
  qrPayload: string;
  expiresAt: number;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function signHandoff(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createCrossDeviceToken(secret: string, payload: Omit<CrossDeviceSessionPayload, "version">): string {
  const full: CrossDeviceSessionPayload = { version: 1, ...payload };
  const body = b64(JSON.stringify(full));
  const sig = signHandoff(secret, body);
  return `${body}.${sig}`;
}

export function verifyCrossDeviceToken(secret: string, token: string, now = Date.now()): CrossDeviceSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts as [string, string];
  const expected = signHandoff(secret, body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed: CrossDeviceSessionPayload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (parsed.version !== 1 || typeof parsed.expiresAt !== "number") return null;
    if (now > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Generates an adaptive Universal Link or WalletConnect-compatible URI for the QR code.
 */
export function generateCrossDeviceHandoff(
  origin: string,
  secret: string,
  params: {
    sessionId: string;
    projectId: string;
    targetChainId: number;
    action: "connect" | "purchase" | "sign";
    ttlMs?: number;
    contextData?: Record<string, unknown>;
  },
): CrossDeviceHandoff {
  const expiresAt = Date.now() + (params.ttlMs ?? 15 * 60 * 1000); // 15 mins default
  const token = createCrossDeviceToken(secret, {
    sessionId: params.sessionId,
    projectId: params.projectId,
    targetChainId: params.targetChainId,
    action: params.action,
    expiresAt,
    contextData: params.contextData,
  });

  const cleanOrigin = origin.replace(/\/$/, "");
  const uri = `${cleanOrigin}/handoff?t=${encodeURIComponent(token)}`;

  return {
    token,
    uri,
    qrPayload: uri,
    expiresAt,
  };
}
