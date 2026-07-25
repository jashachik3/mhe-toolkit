import { Info } from "lucide-react";
import { C } from "../theme";

export function InfoNote({ children, style }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginTop: 16,
        padding: 12,
        background: "#EBEEF0",
        border: `1px solid ${C.hairline}`,
        borderRadius: 4,
        ...style,
      }}
    >
      <Info size={14} color={C.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
