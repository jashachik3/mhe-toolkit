import { C, displayFont, monoFont } from "../theme";

export function Readout({ label, value, unit, big }) {
  return (
    <div style={{ marginBottom: big ? 0 : 10 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textMuted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: monoFont,
          fontSize: big ? 34 : 20,
          color: C.yellow,
          lineHeight: 1.1,
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: big ? 16 : 13, color: C.textMuted, marginLeft: 6 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
