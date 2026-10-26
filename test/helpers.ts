import type { EventType, FailureCase, FlowContext, TimelineEvent } from "../src/types.js";
import { defaultConfig } from "../src/recovery/config.js";

export function mkCase(events: Array<[EventType, Partial<TimelineEvent>?]>, ctx: Partial<FlowContext> = {}, id = "case1"): FailureCase {
  let t = 0;
  return {
    id,
    projectId: "p1",
    context: { flow: "purchase", platform: "ios", inAppBrowser: false, ...ctx },
    events: events.map(([type, extra]) => {
      t += 1000;
      return { type, t, ...extra };
    }),
  };
}

export const cfg = defaultConfig({
  projectId: "p1",
  name: "Moon Pass",
  verifiedOrigin: "https://mint.moonpass.xyz",
  resumeSecret: "test_secret_value_that_is_long_enough",
  holdoutPct: 0,
});
