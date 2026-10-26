import type { Channel, ContactInfo, Diagnosis, FailureCase } from "../types.js";
import { TAXONOMY } from "../taxonomy.js";
import type { ProjectConfig } from "./config.js";
import { PLAYBOOKS, renderTemplate } from "./playbooks.js";
import { buildResumeUrl, createResumeToken, type ResumeAction } from "./resumeLink.js";
import { checkMessage, nextAllowedTime } from "./safety.js";
import { isHoldout } from "../measure/holdout.js";

export type SkipReason =
  | "already_converted"
  | "low_confidence"
  | "holdout"
  | "respect_decline"
  | "not_recoverable"
  | "no_playbook"
  | "education_disabled"
  | "no_consented_channel"
  | "cap_reached"
  | "safety_veto";

export interface History {
  sentForCase: number;
  sentToContactLast7d: number;
  converted: boolean;
}

export type RecoveryPlan =
  | { decision: "skip"; reason: SkipReason; detail?: string[]; resume?: { action: ResumeAction; url: string } }
  | {
      decision: "send";
      channel: Channel;
      destination: string;
      sendAt: number;
      /** When set, the sender must wait until the condition holds before sending. */
      condition?: { type: "gas_below"; gwei: number };
      message: string;
      resume: { action: ResumeAction; url: string };
    };

export interface PlanInput {
  case: FailureCase;
  diagnosis: Diagnosis;
  config: ProjectConfig;
  contact?: ContactInfo;
  history: History;
  now: number;
}

export function planRecovery(input: PlanInput): RecoveryPlan {
  const { case: c, diagnosis, config, contact, history, now } = input;
  const info = TAXONOMY[diagnosis.cause];

  if (history.converted) return { decision: "skip", reason: "already_converted" };
  if (diagnosis.cause === "unknown" || diagnosis.confidence < 0.6) return { decision: "skip", reason: "low_confidence" };
  if (diagnosis.cause === "user_declined") return { decision: "skip", reason: "respect_decline" };
  if (info.recoverability === "none") return { decision: "skip", reason: "not_recoverable" };
  const playbook = PLAYBOOKS[diagnosis.cause];
  if (!playbook) return { decision: "skip", reason: "no_playbook" };
  if (diagnosis.cause === "security_warning_abandon" && !config.sendWarningEducation) return { decision: "skip", reason: "education_disabled" };

  // Build the Resume Link even when we will not message: it still powers the onsite banner for returning visitors.
  const action = playbook.action(c);
  const token = createResumeToken(config.resumeSecret, { p: config.projectId, c: c.id, a: action, e: now + config.linkTtlMs });
  const resume = { action, url: buildResumeUrl(config.verifiedOrigin, token) };

  if (isHoldout(c.id, config.holdoutSalt, config.holdoutPct)) return { decision: "skip", reason: "holdout", resume };
  if (!contact || !contact.consentGivenAt) return { decision: "skip", reason: "no_consented_channel", resume };
  if (history.sentForCase >= config.caps.perCase || history.sentToContactLast7d >= config.caps.perContactPerWeek) {
    return { decision: "skip", reason: "cap_reached", resume };
  }

  const message = renderTemplate(playbook.template, { project: config.name, item: config.itemName, link: resume.url });
  const safety = checkMessage(message, config);
  if (!safety.ok) return { decision: "skip", reason: "safety_veto", detail: safety.reasons, resume };

  const condition = playbook.condition?.(c);
  return {
    decision: "send",
    channel: contact.channel,
    destination: contact.destination,
    sendAt: nextAllowedTime(now + playbook.delayMs, config.quietHours),
    ...(condition ? { condition } : {}),
    message,
    resume,
  };
}
