import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { defaultConfig } from "../recovery/config.js";
import { createEngine } from "../diagnosis/engine.js";
import type { NaiveBayesModel } from "../diagnosis/classifier.js";
import { anthropicProvider } from "../diagnosis/llm/anthropic.js";
import { geminiProvider } from "../diagnosis/llm/gemini.js";
import { openAiCompatProvider } from "../diagnosis/llm/openaiCompat.js";
import type { LlmProvider } from "../diagnosis/llm/provider.js";
import { discordSender, telegramSender, webhookSender, type Senders } from "../channels/index.js";
import { Store } from "./store.js";
import { createApp } from "./app.js";

const env = process.env;
const need = (k: string): string => {
  const v = env[k];
  if (!v) { console.error(`Missing required environment variable ${k}`); process.exit(1); }
  return v;
};

const config = defaultConfig({
  projectId: need("HOMECOMING_PROJECT_ID"),
  name: need("HOMECOMING_PROJECT_NAME"),
  verifiedOrigin: need("HOMECOMING_ORIGIN"),
  resumeSecret: need("HOMECOMING_RESUME_SECRET"),
  ...(env.HOMECOMING_ITEM_NAME ? { itemName: env.HOMECOMING_ITEM_NAME } : {}),
  ...(env.HOMECOMING_HOLDOUT_PCT ? { holdoutPct: Number(env.HOMECOMING_HOLDOUT_PCT) } : {}),
  ...(env.HOMECOMING_AVG_ORDER_USD ? { avgOrderValueUsd: Number(env.HOMECOMING_AVG_ORDER_USD) } : {}),
  ...(env.HOMECOMING_UTC_OFFSET_MINUTES ? { quietHours: { startHour: 22, endHour: 8, utcOffsetMinutes: Number(env.HOMECOMING_UTC_OFFSET_MINUTES) } } : {}),
});

const modelPath = new URL("../../models/naive-bayes.json", import.meta.url);
const model: NaiveBayesModel | undefined = existsSync(modelPath) ? JSON.parse(readFileSync(modelPath, "utf8")) : undefined;

let llm: LlmProvider | undefined;
if (env.ANTHROPIC_API_KEY) llm = anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, ...(env.HOMECOMING_MODEL ? { model: env.HOMECOMING_MODEL } : {}) });
else if (env.GEMINI_API_KEY) llm = geminiProvider({ apiKey: env.GEMINI_API_KEY, model: need("HOMECOMING_MODEL") });
else if (env.HOMECOMING_OPENAI_BASE_URL) llm = openAiCompatProvider({ baseUrl: env.HOMECOMING_OPENAI_BASE_URL, model: need("HOMECOMING_MODEL"), ...(env.HOMECOMING_OPENAI_API_KEY ? { apiKey: env.HOMECOMING_OPENAI_API_KEY } : {}) });

const senders: Senders = {};
if (env.TELEGRAM_BOT_TOKEN) senders.telegram = telegramSender(env.TELEGRAM_BOT_TOKEN);
if (env.DISCORD_BOT_TOKEN) senders.discord = discordSender(env.DISCORD_BOT_TOKEN);
if (env.HOMECOMING_WEBHOOK_URL) { senders.webhook = webhookSender(env.HOMECOMING_WEBHOOK_URL, env.HOMECOMING_WEBHOOK_SECRET); senders.email = senders.webhook; }

const gasOracle = env.HOMECOMING_RPC_URL
  ? async () => {
      const res = await fetch(env.HOMECOMING_RPC_URL!, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }) });
      const j: any = await res.json();
      return typeof j?.result === "string" ? Number(BigInt(j.result)) / 1e9 : undefined;
    }
  : undefined;

const app = createApp({
  config,
  apiKey: need("HOMECOMING_API_KEY"),
  engine: createEngine({ ...(model ? { model } : {}), ...(llm ? { llm } : {}), onLlmError: (e) => console.error("llm error:", e instanceof Error ? e.message : e) }),
  store: new Store(env.HOMECOMING_STATE_FILE ?? "state.json"),
  senders,
  ...(gasOracle ? { gasOracle } : {}),
  auditFile: env.HOMECOMING_AUDIT_FILE ?? "audit.jsonl",
});

setInterval(() => { app.tick().catch((e) => console.error("tick error:", e)); }, 30_000).unref();
const port = Number(env.PORT ?? 8787);
createServer((req, res) => { app.handle(req, res).catch(() => { res.writeHead(500); res.end(); }); }).listen(port, () => {
  console.log(`homecoming listening on :${port} (llm: ${llm ? llm.name : "off"}, channels: ${Object.keys(senders).join(", ") || "none"})`);
});
