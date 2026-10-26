import { readFileSync, writeFileSync } from "node:fs";
import { generate } from "./simulator.js";
import { score } from "./metrics.js";
import { runRules } from "../src/diagnosis/rules.js";
import { predict, type NaiveBayesModel } from "../src/diagnosis/classifier.js";
import { createEngine } from "../src/diagnosis/engine.js";
import type { CauseId } from "../src/types.js";

const model: NaiveBayesModel = JSON.parse(readFileSync(new URL("../models/naive-bayes.json", import.meta.url), "utf8"));
const test = generate(6000, 2026); // different seed from training

const rulesOnly = test.map((t) => ({ truth: t.label, pred: (runRules(t.case)?.cause ?? "unknown") as CauseId }));
const clsOnly = test.map((t) => ({ truth: t.label, pred: predict(model, t.case).cause }));
const engine = createEngine({ model });
const combined: { truth: CauseId; pred: CauseId }[] = [];
for (const t of test) combined.push({ truth: t.label, pred: (await engine.diagnose(t.case)).cause });

const covered = test.filter((t) => {
  const r = runRules(t.case);
  return r && r.confidence >= 0.85;
});
const ruleCorrect = covered.filter((t) => runRules(t.case)!.cause === t.label).length;

const r = score(rulesOnly);
const c = score(clsOnly);
const e = score(combined);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

const lines: string[] = [];
lines.push("# Evaluation report", "");
lines.push("Data: 6000 simulated failures from `eval/simulator.ts` (seed 2026). The classifier was trained on a different seed.");
lines.push("Read this as a regression and consistency check. It says nothing about accuracy on live traffic, which needs real labeled cases.", "");
lines.push("| Layer | Accuracy | Macro F1 |", "| --- | --- | --- |");
lines.push(`| Rules only (unmatched counted as unknown) | ${pct(r.accuracy)} | ${pct(r.macroF1)} |`);
lines.push(`| Classifier only | ${pct(c.accuracy)} | ${pct(c.macroF1)} |`);
lines.push(`| Engine (rules, then classifier, no LLM) | ${pct(e.accuracy)} | ${pct(e.macroF1)} |`, "");
lines.push(`Rules cover ${pct(covered.length / test.length)} of cases at confidence 0.85 or higher, and are right on ${pct(ruleCorrect / Math.max(1, covered.length))} of those.`, "");
lines.push("## Per cause, engine", "", "| Cause | Support | Precision | Recall | F1 |", "| --- | --- | --- | --- | --- |");
for (const p of e.per.filter((x) => x.support > 0)) lines.push(`| ${p.cause} | ${p.support} | ${pct(p.precision)} | ${pct(p.recall)} | ${pct(p.f1)} |`);
const md = lines.join("\n") + "\n";
writeFileSync(new URL("./REPORT.md", import.meta.url), md);
console.log(md);
