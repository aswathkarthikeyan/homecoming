export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
}

export const DEFAULT_DARK_THEME: ThemeConfig = {
  primaryColor: "#3b82f6",
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  textColor: "#f8fafc",
  cardBackground: "#1e293b",
  borderColor: "#334155",
  borderRadius: "12px",
  fontFamily: "Inter, system-ui, sans-serif",
};

export const DEFAULT_LIGHT_THEME: ThemeConfig = {
  primaryColor: "#2563eb",
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  textColor: "#0f172a",
  cardBackground: "#f1f5f9",
  borderColor: "#cbd5e1",
  borderRadius: "12px",
  fontFamily: "Inter, system-ui, sans-serif",
};
