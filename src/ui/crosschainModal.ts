import type { CrossChainRescuePlan, BridgeRoute } from "../crosschain/types.js";
import { DEFAULT_DARK_THEME, type ThemeConfig } from "./theme.js";

/**
 * Renders the interactive Cross-Chain Balance Rescue Modal widget.
 */
export function renderCrossChainRescueModalHtml(
  plan: CrossChainRescuePlan,
  theme: ThemeConfig = DEFAULT_DARK_THEME,
): string {
  if (plan.status !== "surplus_found" || !plan.recommendedRoute) {
    return `
<div id="homecoming-rescue-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:${theme.fontFamily};">
  <div style="background:${theme.cardBackground};border:1px solid ${theme.borderColor};border-radius:${theme.borderRadius};padding:24px;max-width:440px;width:92%;color:${theme.textColor};box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Insufficient Balance</h3>
      <button id="homecoming-close-btn" style="background:transparent;border:none;color:${theme.textColor};font-size:1.3rem;cursor:pointer;">&times;</button>
    </div>
    <p style="font-size:0.95rem;opacity:0.85;line-height:1.5;">You need ${plan.deficit.neededAmount} ${plan.deficit.tokenSymbol} on ${plan.deficit.chainName}, but no surplus funds were discovered across connected networks.</p>
    <a href="https://global.transak.com" target="_blank" rel="noreferrer" style="display:inline-block;background:${theme.primaryColor};color:#fff;padding:10px 18px;border-radius:${theme.borderRadius};text-decoration:none;font-weight:600;margin-top:10px;">Top Up with Card / On-Ramp</a>
  </div>
</div>
    `.trim();
  }

  const route = plan.recommendedRoute;

  const altRoutesHtml =
    plan.alternativeRoutes.length > 0
      ? `
    <div style="margin-top:14px;border-top:1px solid ${theme.borderColor};padding-top:12px;">
      <span style="font-size:0.8rem;opacity:0.75;font-weight:600;">OTHER AVAILABLE SOURCES:</span>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:6px;">
        ${plan.alternativeRoutes
          .map(
            (alt: BridgeRoute) => `
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:8px;font-size:0.85rem;">
            <span>${alt.originChainName} (${alt.inputAmount} ${alt.inputTokenSymbol})</span>
            <span style="opacity:0.8;">~${alt.estimatedDurationSeconds}s &bull; $${alt.fee.totalFeeUsd}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
    `
      : "";

  return `
<div id="homecoming-rescue-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:${theme.fontFamily};">
  <div id="homecoming-rescue-card" style="background:${theme.cardBackground};border:1px solid ${theme.borderColor};border-radius:${theme.borderRadius};padding:24px;max-width:480px;width:92%;color:${theme.textColor};box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">
    
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="background:#22c55e;color:#fff;font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:999px;">LIQUIDITY FOUND</span>
        <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Cross-Chain Balance Rescue</h3>
      </div>
      <button id="homecoming-close-btn" style="background:transparent;border:none;color:${theme.textColor};font-size:1.3rem;cursor:pointer;">&times;</button>
    </div>

    <!-- Deficit Notice -->
    <p style="margin:0 0 16px 0;font-size:0.92rem;line-height:1.5;opacity:0.9;">
      Your wallet is short <strong>${plan.deficit.shortfall} ${plan.deficit.tokenSymbol}</strong> on <strong>${plan.deficit.chainName}</strong>, but we located available liquidity on <strong>${route.originChainName}</strong>!
    </p>

    <!-- Visual Route Box -->
    <div style="background:rgba(0,0,0,0.25);border:1px solid ${theme.borderColor};border-radius:10px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;font-weight:600;margin-bottom:8px;">
        <span>${route.originChainName}</span>
        <span style="opacity:0.6;">&rarr; Across Fast Relayer &rarr;</span>
        <span>${route.targetChainName}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;opacity:0.8;">
        <span>Bridge: ${route.inputAmount} ${route.inputTokenSymbol}</span>
        <span>Est. Time: ~${route.estimatedDurationSeconds}s</span>
        <span>Fee: $${route.fee.totalFeeUsd}</span>
      </div>
    </div>

    <!-- 1-Click Action Button -->
    <button id="homecoming-bridge-btn" data-payload="${encodeURIComponent(JSON.stringify(route.executionPayload))}" style="width:100%;background:${theme.primaryColor};color:#fff;padding:12px 18px;border-radius:${theme.borderRadius};border:none;cursor:pointer;font-weight:700;font-size:1rem;display:flex;justify-content:center;align-items:center;gap:8px;transition:opacity 0.2s;">
      Bridge & Complete Purchase in 1-Click
    </button>

    ${altRoutesHtml}
  </div>
</div>
  `.trim();
}
