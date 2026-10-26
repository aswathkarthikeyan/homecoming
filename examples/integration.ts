// Browser side. Wrap the provider your wallet library gives you.
import { FlowRecorder } from "../src/sdk/recorder.js";

declare const ethereum: { request(args: { method: string; params?: unknown }): Promise<unknown> };

const recorder = new FlowRecorder({
  projectId: "moonpass",
  endpoint: "https://recover.example.xyz/v1/cases",
  context: { flow: "purchase", targetChainId: 8453, gasBaselineGwei: 0.05 },
  // Pass a contact only after the user opted in, for example by starting your Telegram bot.
  // contact: { channel: "telegram", destination: chatId, consentGivenAt: Date.now() },
});

const provider = recorder.wrap(ethereum);
// use `provider` for requests as usual, then:
// recorder.success() after a confirmed purchase.
export { provider, recorder };
