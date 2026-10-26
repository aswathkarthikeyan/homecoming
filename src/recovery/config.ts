export interface QuietHours {
  /** Local hour when quiet time starts, 0 to 23. */
  startHour: number;
  /** Local hour when quiet time ends, 0 to 23. */
  endHour: number;
  /** Offset of the audience from UTC in minutes, for example 330 for India. */
  utcOffsetMinutes: number;
}

export interface ProjectConfig {
  projectId: string;
  name: string;
  /** Word used in messages, for example "NFT", "token" or "pass". */
  itemName: string;
  /** The only origin any message may link to. Example: https://mint.example.xyz */
  verifiedOrigin: string;
  /** Secret used to sign Resume Links. Keep it server side. */
  resumeSecret: string;
  /** Share of recoverable cases deliberately left alone to measure real lift, 0 to 0.5. */
  holdoutPct: number;
  holdoutSalt: string;
  quietHours?: QuietHours;
  caps: { perCase: number; perContactPerWeek: number };
  /** Resume Links expire. Default 48 hours. */
  linkTtlMs: number;
  /** When true, users who left after a security warning may receive an educational note (never a purchase push). */
  sendWarningEducation: boolean;
  avgOrderValueUsd?: number;
}

export function defaultConfig(partial: Pick<ProjectConfig, "projectId" | "name" | "verifiedOrigin" | "resumeSecret"> & Partial<ProjectConfig>): ProjectConfig {
  return {
    itemName: "purchase",
    holdoutPct: 0.1,
    holdoutSalt: partial.projectId,
    caps: { perCase: 2, perContactPerWeek: 3 },
    linkTtlMs: 48 * 3600_000,
    sendWarningEducation: false,
    ...partial,
  };
}
