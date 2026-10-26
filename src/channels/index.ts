import type { Channel } from "../types.js";

/** A sender moves one already approved message. All safety decisions are made before this point. */
export type Sender = (destination: string, text: string) => Promise<void>;
export type Senders = Partial<Record<Channel, Sender>>;

async function check(res: Response, what: string): Promise<any> {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what} failed with ${res.status}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/** Telegram Bot API. The user must have started a chat with the bot, which is the consent step. */
export function telegramSender(botToken: string): Sender {
  return async (chatId, text) => {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    await check(res, "telegram sendMessage");
  };
}

/**
 * Discord direct message through a bot. Discord only allows this when the user
 * shares a server with the bot and has direct messages enabled.
 */
export function discordSender(botToken: string): Sender {
  const headers = { "content-type": "application/json", authorization: `Bot ${botToken}` };
  return async (userId, text) => {
    const dm = await check(
      await fetch("https://discord.com/api/v10/users/@me/channels", { method: "POST", headers, body: JSON.stringify({ recipient_id: userId }) }),
      "discord create dm",
    );
    await check(
      await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, { method: "POST", headers, body: JSON.stringify({ content: text }) }),
      "discord send message",
    );
  };
}

/** Generic webhook for email gateways, Slack, or your own CRM. */
export function webhookSender(url: string, secret?: string): Sender {
  return async (destination, text) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(secret ? { authorization: `Bearer ${secret}` } : {}) },
      body: JSON.stringify({ destination, text }),
    });
    await check(res, "webhook");
  };
}
