import type { FailureCase } from "./types.js";

/**
 * Strips identifiers before anything leaves the process for a hosted model.
 * Contact details are never part of a FailureCase, but wallets and pages can
 * echo addresses, hashes, emails and handles inside error messages.
 */

const ADDRESS = /0x[a-fA-F0-9]{40}\b/g;
const HASH = /0x[a-fA-F0-9]{64}\b/g;
const EMAIL = /[A-Za-z0-9._%+]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}/g;
const HANDLE = /(^|\s)@[A-Za-z0-9_]{3,32}\b/g;
const URL_QUERY = /(https?:\/\/[^\s?#]+)[?#][^\s]*/g;
const LONG_HEX = /\b[a-fA-F0-9]{32,}\b/g;

export function redactText(text: string, maxLen = 200): string {
  return text
    .replace(HASH, "[tx_hash]")
    .replace(ADDRESS, "[address]")
    .replace(EMAIL, "[email]")
    .replace(HANDLE, "$1[handle]")
    .replace(URL_QUERY, "$1")
    .replace(LONG_HEX, "[hex]")
    .slice(0, maxLen);
}

export function redactCase(c: FailureCase): FailureCase {
  return {
    id: c.id,
    projectId: c.projectId,
    context: { ...c.context },
    events: c.events.map((e) => ({
      type: e.type,
      t: e.t,
      ...(e.code !== undefined ? { code: e.code } : {}),
      ...(e.message !== undefined ? { message: redactText(e.message) } : {}),
    })),
  };
}
