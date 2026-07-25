import { ArrowLeft } from "lucide-react";
import { C, displayFont } from "../theme";

export function Header({ title, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "16px 16px 14px",
        borderBottom: `1px solid ${C.hairline}`,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            color: C.textMuted,
            display: "flex",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 19,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: C.text,
        }}
      >
        {title}
      </div>
    </div>
  );
}
