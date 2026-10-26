import type { ProjectConfig, QuietHours } from "./config.js";

/**
 * The safety layer can veto any message. It exists because win back messages in
 * crypto look exactly like phishing, and a recovery tool that trains users to
 * click unsolicited links does more harm than the lost sale.
 */

const BANNED: { pattern: RegExp; reason: string }[] = [
  { pattern: /seed phrase|recovery phrase|private key|secret key/i, reason: "mentions secrets" },
  { pattern: /verify (your )?wallet|validate (your )?wallet|sync (your )?wallet|wallet (has been )?(suspended|locked)/i, reason: "wallet verification language used by phishing" },
  { pattern: /urgent|act (now|fast)|last chance|hurry|expires? (soon|today)|limited time/i, reason: "pressure language" },
  { pattern: /claim (now|your)|airdrop|free (mint|tokens?)|giveaway/i, reason: "claim or giveaway language" },
  { pattern: /sign (now|immediately)|approve (now|immediately)|connect (now|immediately)/i, reason: "pushes the user to sign" },
];

const URL_RE = /https?:\/\/[^\s)>"]+/gi;

export interface SafetyResult {
  ok: boolean;
  reasons: string[];
}

export function checkMessage(text: string, cfg: Pick<ProjectConfig, "verifiedOrigin">): SafetyResult {
  const reasons: string[] = [];
  if (text.length > 600) reasons.push("message too long");
  for (const b of BANNED) if (b.pattern.test(text)) reasons.push(b.reason);

  const origin = cfg.verifiedOrigin.replace(/\/$/, "");
  const urls = text.match(URL_RE) ?? [];
  if (urls.length === 0) reasons.push("no link to the verified origin");
  if (urls.length > 1) reasons.push("more than one link");
  for (const u of urls) {
    if (!(u === origin || u.startsWith(`${origin}/`))) reasons.push(`link outside the verified origin: ${u.slice(0, 60)}`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function inQuietHours(now: number, q: QuietHours): boolean {
  const local = localHour(now, q.utcOffsetMinutes);
  return q.startHour <= q.endHour ? local >= q.startHour && local < q.endHour : local >= q.startHour || local < q.endHour;
}

export function localHour(now: number, utcOffsetMinutes: number): number {
  const minutes = Math.floor(now / 60_000) + utcOffsetMinutes;
  return ((Math.floor(minutes / 60) % 24) + 24) % 24;
}

/** Earliest time at or after `when` that is outside quiet hours. */
export function nextAllowedTime(when: number, q?: QuietHours): number {
  if (!q) return when;
  let t = when;
  for (let i = 0; i < 48 && inQuietHours(t, q); i++) t = (Math.floor(t / 3_600_000) + 1) * 3_600_000;
  return t;
}
