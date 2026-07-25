import type { CSSProperties } from "react";

// ---------- Design tokens (LogistiQ brand palette) ----------
export interface ColorTokens {
  bg: string;
  panel: string;
  panelRaised: string;
  hairline: string;
  text: string;
  textMuted: string;
  navy: string;
  green: string;
  greenDim: string;
  gray: string;
  warn: string;
  // Legacy aliases from an earlier dark-theme iteration, mapped to navy
  // and green respectively for backward compatibility — don't rely on
  // the names, they're aliases now.
  yellow: string;
  yellowDim: string;
  steel: string;
}

export const C: ColorTokens = {
  bg: "#F2F4F5",
  panel: "#FFFFFF",
  panelRaised: "#FFFFFF",
  hairline: "#DCE0E2",
  text: "#0F2138",
  textMuted: "#75797C",
  navy: "#002F6C",
  green: "#78BE20",
  greenDim: "#5A9017",
  gray: "#888B8D",
  warn: "#C24A3B",
  yellow: "#002F6C",
  yellowDim: "#5A9017",
  steel: "#78BE20",
};

export const displayFont = "'Verdana', 'Azo Sans', system-ui, sans-serif";
export const monoFont =
  "ui-monospace, 'SF Mono', 'Roboto Mono', 'Courier New', monospace";
export const bodyFont =
  "'Verdana', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export const fieldLabelStyle: CSSProperties = {
  fontFamily: displayFont,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.textMuted,
  marginBottom: 6,
};
