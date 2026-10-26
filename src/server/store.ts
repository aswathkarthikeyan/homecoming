import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { Channel, CauseId } from "../types.js";
import type { History } from "../recovery/policy.js";

export interface CaseRecord {
  caseId: string;
  cause: CauseId;
  arm?: "treated" | "holdout";
  converted: boolean;
  contactKey?: string;
  sentAt: number[];
}

export interface QueuedMessage {
  caseId: string;
  channel: Channel;
  destination: string;
  message: string;
  sendAt: number;
  expiresAt: number;
  condition?: { type: "gas_below"; gwei: number };
}

interface Snapshot {
  cases: CaseRecord[];
  queue: QueuedMessage[];
}

/** Hash of the contact so counters and audit logs never hold a raw handle. */
export function contactKey(channel: Channel, destination: string): string {
  return createHash("sha256").update(`${channel}:${destination}`).digest("hex").slice(0, 24);
}

const WEEK = 7 * 24 * 3600_000;

/** In memory store with an optional JSON snapshot so a restart does not forget caps or the queue. */
export class Store {
  private cases = new Map<string, CaseRecord>();
  queue: QueuedMessage[] = [];

  constructor(private readonly file?: string) {
    if (file && existsSync(file)) {
      const snap: Snapshot = JSON.parse(readFileSync(file, "utf8"));
      for (const c of snap.cases) this.cases.set(c.caseId, c);
      this.queue = snap.queue;
    }
  }

  get(caseId: string): CaseRecord | undefined {
    return this.cases.get(caseId);
  }

  upsert(rec: CaseRecord): void {
    this.cases.set(rec.caseId, rec);
    this.persist();
  }

  all(): CaseRecord[] {
    return [...this.cases.values()];
  }

  history(caseId: string, key: string | undefined, now: number): History {
    const rec = this.cases.get(caseId);
    let week = 0;
    if (key) for (const c of this.cases.values()) if (c.contactKey === key) week += c.sentAt.filter((t) => now - t < WEEK).length;
    return { sentForCase: rec ? rec.sentAt.length : 0, sentToContactLast7d: week, converted: rec?.converted ?? false };
  }

  persist(): void {
    if (!this.file) return;
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify({ cases: this.all(), queue: this.queue } satisfies Snapshot));
    renameSync(tmp, this.file);
  }
}
