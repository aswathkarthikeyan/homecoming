import type { ModalViewModel } from "./types.js";
import { DEFAULT_DARK_THEME, type ThemeConfig } from "./theme.js";

export function renderInFlightModalHtml(vm: ModalViewModel, theme: ThemeConfig = DEFAULT_DARK_THEME): string {
  if (vm.state === "idle" || vm.state === "dismissed") return "";

  const actionButton = vm.resolution
    ? `<button id="homecoming-action-btn" style="background:${theme.primaryColor};color:#fff;padding:10px 18px;border-radius:${theme.borderRadius};border:none;cursor:pointer;font-weight:600;margin-top:12px;">
         ${vm.resolution.title}
       </button>`
    : "";

  return `
<div id="homecoming-modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:${theme.fontFamily};">
  <div id="homecoming-modal-dialog" style="background:${theme.cardBackground};border:1px solid ${theme.borderColor};border-radius:${theme.borderRadius};padding:24px;max-width:440px;width:90%;color:${theme.textColor};box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3 style="margin:0;font-size:1.15rem;font-weight:700;">${vm.title}</h3>
      <button id="homecoming-close-btn" style="background:transparent;border:none;color:${theme.textColor};font-size:1.2rem;cursor:pointer;">&times;</button>
    </div>
    <p style="margin:0 0 16px 0;font-size:0.95rem;line-height:1.5;opacity:0.9;">${vm.description}</p>
    ${actionButton}
  </div>
</div>
  `.trim();
}
