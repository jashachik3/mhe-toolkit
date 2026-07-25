import { C, bodyFont, fieldLabelStyle } from "../theme";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
}

export function Select({ label, value, onChange, options, hint }: SelectProps) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={fieldLabelStyle}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: C.bg,
          border: `1px solid ${C.hairline}`,
          borderRadius: 3,
          color: C.text,
          fontFamily: bodyFont,
          fontSize: 14,
          padding: "10px 12px",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
          {hint}
        </div>
      )}
    </label>
  );
}
