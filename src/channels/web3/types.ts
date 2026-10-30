export interface Web3Recipient {
  walletAddress: string;
  ensOrBasename?: string;
  chainId?: number;
  farcasterFid?: number;
}

export interface Web3DispatchResponse {
  success: boolean;
  channel: "xmtp" | "push_protocol" | "farcaster_frame" | "web_push";
  targetAddress: string;
  messageId?: string;
  error?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  ctaUrl: string;
  icon?: string;
  badge?: string;
}

export interface FarcasterFrameButton {
  label: string;
  action: "link" | "post" | "mint";
  target?: string;
}

export interface FarcasterFrameConfig {
  title: string;
  imageUrl: string;
  buttons: FarcasterFrameButton[];
  postUrl: string;
  aspectRatio?: "1.91:1" | "1:1";
  state?: Record<string, any>;
}
