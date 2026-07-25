import { C, monoFont, fieldLabelStyle } from "../theme";
import { useUnitSystem } from "../lib/unitSystem";
import { unitLabel } from "../lib/units";

// `kind` (e.g. "length_in", "speed_ftmin") picks the unit label from the
// current global unit system and overrides `unit`. Omit `kind` for
// dimensionless fields (counts, %, friction factor, degrees) that don't
// change between imperial and metric — `unit` alone still works for those.
export function Field({ label, unit, kind, value, onChange, step = "any", hint }) {
  const system = useUnitSystem();
  const displayUnit = kind ? unitLabel(kind, system) : unit;
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: C.bg,
            border: `1px solid ${C.hairline}`,
            borderRight: displayUnit ? "none" : `1px solid ${C.hairline}`,
            borderRadius: displayUnit ? "3px 0 0 3px" : 3,
            color: C.text,
            fontFamily: monoFont,
            fontSize: 16,
            padding: "10px 12px",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.yellow)}
          onBlur={(e) => (e.target.style.borderColor = C.hairline)}
        />
        {displayUnit && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              background: "#EBEDEE",
              border: `1px solid ${C.hairline}`,
              borderLeft: "none",
              borderRadius: "0 3px 3px 0",
              fontFamily: monoFont,
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            {displayUnit}
          </div>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
          {hint}
        </div>
      )}
    </label>
  );
}
