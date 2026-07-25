import type { CSSProperties, ReactNode } from "react";
import { C } from "../theme";

// Rivet corner decoration for "spec plate" panels
function Rivets() {
  const dot: CSSProperties = {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#C7CBCD",
    boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.6)",
  };
  return (
    <>
      <div style={{ ...dot, top: 8, left: 8 }} />
      <div style={{ ...dot, top: 8, right: 8 }} />
      <div style={{ ...dot, bottom: 8, left: 8 }} />
      <div style={{ ...dot, bottom: 8, right: 8 }} />
    </>
  );
}

interface PlateProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Plate({ children, style }: PlateProps) {
  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${C.panelRaised}, ${C.panel})`,
        border: `1px solid ${C.hairline}`,
        borderRadius: 4,
        padding: "18px 16px",
        boxShadow: "0 1px 2px rgba(15,33,56,0.06), 0 4px 12px rgba(15,33,56,0.05)",
        ...style,
      }}
    >
      <Rivets />
      {children}
    </div>
  );
}
