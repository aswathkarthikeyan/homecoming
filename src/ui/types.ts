import type { InFlightResolution } from "../healing/types.js";

export type ModalState = "idle" | "intercepted" | "action_pending" | "resolved" | "dismissed";

export interface ModalViewModel {
  state: ModalState;
  title: string;
  description: string;
  resolution?: InFlightResolution;
  errorSnippet?: string;
  autoExecuteRemainingSeconds?: number;
}
