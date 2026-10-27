import { appendFileSync } from "node:fs";
import { randomUUID, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ContactInfo, FailureCase } from "../types.js";
import type { ProjectConfig } from "../recovery/config.js";
import { planRecovery } from "../recovery/policy.js";
import { verifyResumeToken } from "../recovery/resumeLink.js";
import { computeLift } from "../measure/holdout.js";
import type { Senders } from "../channels/index.js";
import { contactKey, Store } from "./store.js";
import { isCauseId } from "../taxonomy.js";
import { CrossChainRescueEngine, scanMultiChainBalances } from "../crosschain/index.js";

export interface AppDeps {
  config: ProjectConfig;
  apiKey: string;
  engine: { diagnose(c: FailureCase): Promise<import("../types.js").Diagnosis> };
  store: Store;
  senders: Senders;
  /** Returns the current gas price in gwei for the target chain, or undefined if unknown. */
  gasOracle?: (chainId?: number) => Promise<number | undefined>;
  crossChainEngine?: { planRescue(params: any): Promise<any>; scanBalances?(addr: string): Promise<any> };
  auditFile?: string;
  now?: () => number;
}

const MAX_BODY = 64 * 1024;

export function createApp(deps: AppDeps) {
  const now = deps.now ?? Date.now;
  const audit = (entry: Record<string, unknown>) => {
    if (deps.auditFile) appendFileSync(deps.auditFile, JSON.stringify({ at: now(), ...entry }) + "\n");
  };

  const authed = (req: IncomingMessage): boolean => {
    const h = req.headers.authorization ?? "";
    const given = Buffer.from(h.startsWith("Bearer ") ? h.slice(7) : "");
    const want = Buffer.from(deps.apiKey);
    return given.length === want.length && timingSafeEqual(given, want);
  };

  const json = (res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) => {
    res.writeHead(status, { "content-type": "application/json", ...extra });
    res.end(JSON.stringify(body));
  };

  const readBody = (req: IncomingMessage): Promise<any> =>
    new Promise((resolve, reject) => {
      let size = 0;
      let tooLarge = false;
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => {
        size += c.length;
        // Past the cap we stop buffering but keep draining so the client can read our 413.
        // Anything absurdly large is cut off instead.
        if (size > MAX_BODY * 16) return void req.destroy();
        if (size > MAX_BODY) tooLarge = true;
        else chunks.push(c);
      });
      req.on("end", () => {
        if (tooLarge) return reject(new Error("body too large"));
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
        } catch {
          reject(new Error("invalid json"));
        }
      });
      req.on("error", reject);
    });

  function validCase(x: any): x is FailureCase {
    return (
      x && typeof x.id === "string" && x.id.length > 0 && x.id.length < 128 && x.context && typeof x.context === "object" &&
      Array.isArray(x.events) && x.events.length <= 200
    );
  }

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const cors = { "access-control-allow-origin": deps.config.verifiedOrigin, vary: "origin" };

    try {
      if (req.method === "OPTIONS") {
        res.writeHead(204, { ...cors, "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST" });
        return void res.end();
      }
      if (req.method === "GET" && url.pathname === "/healthz") return json(res, 200, { ok: true });

      if (req.method === "GET" && url.pathname === "/v1/resume") {
        const out = verifyResumeToken(deps.config.resumeSecret, url.searchParams.get("t") ?? "", now());
        if (!out.ok) return json(res, 400, { ok: false, reason: out.reason }, cors);
        return json(res, 200, { ok: true, caseId: out.payload.c, action: out.payload.a }, cors);
      }

      if (!authed(req)) return json(res, 401, { error: "unauthorized" });

      if (req.method === "POST" && url.pathname === "/v1/cases") {
        const body = await readBody(req);
        if (!validCase(body.case)) return json(res, 400, { error: "invalid case" });
        const c: FailureCase = { ...body.case, projectId: deps.config.projectId };
        const contact: ContactInfo | undefined = body.contact && typeof body.contact.destination === "string" ? body.contact : undefined;
        const t = now();

        const diagnosis = await deps.engine.diagnose(c);
        const key = contact ? contactKey(contact.channel, contact.destination) : undefined;
        const history = deps.store.history(c.id, key, t);
        const plan = planRecovery({ case: c, diagnosis, config: deps.config, ...(contact ? { contact } : {}), history, now: t });

        const prev = deps.store.get(c.id);
        const arm = plan.decision === "send" ? "treated" : plan.decision === "skip" && plan.reason === "holdout" ? "holdout" : undefined;
        deps.store.upsert({
          caseId: c.id,
          cause: diagnosis.cause,
          ...(arm ? { arm } : prev?.arm ? { arm: prev.arm } : {}),
          converted: prev?.converted ?? false,
          ...(key ? { contactKey: key } : prev?.contactKey ? { contactKey: prev.contactKey } : {}),
          sentAt: prev?.sentAt ?? [],
        });

        if (plan.decision === "send") {
          deps.store.queue.push({
            caseId: c.id, channel: plan.channel, destination: plan.destination, message: plan.message, sendAt: plan.sendAt,
            expiresAt: plan.sendAt + 24 * 3600_000, ...(plan.condition ? { condition: plan.condition } : {}),
          });
          deps.store.persist();
        }
        audit({ caseId: c.id, cause: diagnosis.cause, confidence: diagnosis.confidence, source: diagnosis.source, evidence: diagnosis.evidence, decision: plan.decision, reason: plan.decision === "skip" ? plan.reason : undefined, detail: plan.decision === "skip" ? plan.detail : undefined });

        return json(res, 200, {
          diagnosis,
          plan: plan.decision === "send"
            ? { decision: "send", channel: plan.channel, sendAt: plan.sendAt, condition: plan.condition ?? null, resumeUrl: plan.resume.url }
            : { decision: "skip", reason: plan.reason, detail: plan.detail ?? [], resumeUrl: plan.resume?.url ?? null },
        });
      }

      if (req.method === "POST" && url.pathname === "/v1/outcomes") {
        const body = await readBody(req);
        const rec = typeof body.caseId === "string" ? deps.store.get(body.caseId) : undefined;
        if (!rec) return json(res, 404, { error: "unknown case" });
        rec.converted = body.converted === true;
        deps.store.upsert(rec);
        audit({ caseId: rec.caseId, outcome: rec.converted ? "converted" : "not_converted" });
        return json(res, 200, { ok: true });
      }

      if (req.method === "GET" && url.pathname === "/v1/report") {
        const recs = deps.store.all();
        const treated = recs.filter((r) => r.arm === "treated");
        const holdout = recs.filter((r) => r.arm === "holdout");
        const lift = computeLift(
          { treated: treated.length, treatedConverted: treated.filter((r) => r.converted).length, holdout: holdout.length, holdoutConverted: holdout.filter((r) => r.converted).length },
          deps.config.avgOrderValueUsd,
        );
        const byCause: Record<string, number> = {};
        for (const r of recs) byCause[r.cause] = (byCause[r.cause] ?? 0) + 1;
        return json(res, 200, { lift, casesByCause: byCause });
      }

      if (req.method === "POST" && url.pathname === "/v1/crosschain/scan") {
        const body = await readBody(req);
        if (!body.address || typeof body.address !== "string") {
          return json(res, 400, { error: "missing address parameter" }, cors);
        }
        const balances = deps.crossChainEngine?.scanBalances
          ? await deps.crossChainEngine.scanBalances(body.address)
          : await scanMultiChainBalances(body.address);
        return json(res, 200, { address: body.address, balances }, cors);
      }

      if (req.method === "POST" && url.pathname === "/v1/crosschain/rescue") {
        const body = await readBody(req);
        if (!body.userAddress || typeof body.targetChainId !== "number" || typeof body.neededAmount !== "number") {
          return json(res, 400, { error: "missing required parameters: userAddress, targetChainId, neededAmount" }, cors);
        }
        const engine = deps.crossChainEngine ?? new CrossChainRescueEngine();
        const plan = await engine.planRescue({
          userAddress: body.userAddress,
          targetChainId: body.targetChainId,
          neededAmount: body.neededAmount,
          tokenSymbol: body.tokenSymbol,
          preferredOriginChainId: body.preferredOriginChainId,
        });
        return json(res, 200, plan, cors);
      }

      if (req.method === "GET" && url.pathname === "/v1/cause" && isCauseId(url.searchParams.get("id"))) {
        return json(res, 200, { id: url.searchParams.get("id") });
      }

      return json(res, 404, { error: "not found" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error";
      return json(res, msg === "body too large" ? 413 : 400, { error: msg });
    }
  }

  /** Sends due messages. Call on an interval. Returns how many were sent. */
  async function tick(): Promise<number> {
    const t = now();
    let sent = 0;
    const remaining: typeof deps.store.queue = [];
    for (const q of deps.store.queue) {
      const rec = deps.store.get(q.caseId);
      if (t > q.expiresAt || rec?.converted) continue;
      if (t < q.sendAt) { remaining.push(q); continue; }
      if (q.condition?.type === "gas_below") {
        const gas = deps.gasOracle ? await deps.gasOracle() : undefined;
        if (gas === undefined || gas > q.condition.gwei) { remaining.push(q); continue; }
      }
      const sender = deps.senders[q.channel];
      if (!sender) { audit({ caseId: q.caseId, error: `no sender for ${q.channel}` }); continue; }
      try {
        await sender(q.destination, q.message);
        if (rec) { rec.sentAt.push(t); deps.store.upsert(rec); }
        audit({ caseId: q.caseId, sent: true, channel: q.channel });
        sent++;
      } catch (err) {
        audit({ caseId: q.caseId, sent: false, error: err instanceof Error ? err.message : "send failed" });
      }
    }
    deps.store.queue = remaining;
    deps.store.persist();
    return sent;
  }

  return { handle, tick, newId: () => randomUUID() };
}
