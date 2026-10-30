import type { FarcasterFrameConfig } from "./types.js";

/**
 * Generates an interactive Farcaster Frame v2 metadata bundle and HTML page.
 * Allows users encountering a transaction failure to resume and finalize
 * their purchase or mint directly within Warpcast or any Farcaster client.
 */
export function generateResumeFarcasterFrame(config: FarcasterFrameConfig): {
  html: string;
  metaTags: Record<string, string>;
} {
  const metaTags: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": config.imageUrl,
    "fc:frame:image:aspect_ratio": config.aspectRatio ?? "1.91:1",
    "fc:frame:post_url": config.postUrl,
  };

  config.buttons.forEach((btn, idx) => {
    const num = idx + 1;
    metaTags[`fc:frame:button:${num}`] = btn.label;
    metaTags[`fc:frame:button:${num}:action`] = btn.action;
    if (btn.target) {
      metaTags[`fc:frame:button:${num}:target`] = btn.target;
    }
  });

  if (config.state) {
    metaTags["fc:frame:state"] = JSON.stringify(config.state);
  }

  const metaHtml = Object.entries(metaTags)
    .map(([key, val]) => `    <meta property="${key}" content="${escapeHtml(val)}" />`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(config.title)}</title>
${metaHtml}
  </head>
  <body style="font-family: sans-serif; background: #0c0d12; color: #fff; padding: 2rem;">
    <h1>${escapeHtml(config.title)}</h1>
    <p>Open in Warpcast or any Farcaster client to resume your checkout in 1-click.</p>
  </body>
</html>`;

  return { html, metaTags };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
