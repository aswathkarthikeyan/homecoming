export interface WebPushPayloadOptions {
  title: string;
  body: string;
  resumeUrl: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Builds standard W3C Web Push notification JSON payload for PWA service workers.
 * Used for zero-identity anonymous browser notifications when user tabs close.
 */
export function buildWebPushPayload(options: WebPushPayloadOptions): string {
  const payload = {
    notification: {
      title: options.title,
      body: options.body,
      icon: options.icon ?? "/favicon.ico",
      badge: options.badge ?? "/badge.png",
      tag: options.tag ?? "homecoming_recovery",
      data: {
        url: options.resumeUrl,
        timestamp: Date.now(),
        ...options.data,
      },
      actions: [
        {
          action: "resume_checkout",
          title: "Complete Checkout",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    },
  };

  return JSON.stringify(payload);
}
