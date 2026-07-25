// ---------- Design tokens (LogistiQ brand palette) ----------
export const C = {
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
};
// Back-compat aliases so the rest of the component tree (written against
// the old dark-theme token names) picks up the new brand colors.
C.yellow = C.navy;
C.yellowDim = C.greenDim;
C.steel = C.green;

export const displayFont = "'Verdana', 'Azo Sans', system-ui, sans-serif";
export const monoFont =
  "ui-monospace, 'SF Mono', 'Roboto Mono', 'Courier New', monospace";
export const bodyFont =
  "'Verdana', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

export const fieldLabelStyle = {
  fontFamily: displayFont,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.textMuted,
  marginBottom: 6,
};
