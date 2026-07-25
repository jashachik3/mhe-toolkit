import type { ReactNode } from "react";
import { Gauge, Zap, RotateCw, Layers, ChevronsRight, BookOpen } from "lucide-react";
import { C, displayFont } from "../theme";
import { useUnitSystem, switchUnitSystem } from "../lib/unitSystem";
import type { UnitSystem } from "../lib/units";
import type { ScreenProps } from "../lib/routing";
import { Plate } from "../components/Plate";
import { InfoNote } from "../components/InfoNote";

const UNIT_SYSTEM_OPTIONS: { k: UnitSystem; label: string }[] = [
  { k: "imperial", label: "Imperial (in / ft / lb)" },
  { k: "metric", label: "Metric (cm / m / kg)" },
];

interface ModuleCardProps {
  icon: ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  accent: string;
}

function ModuleCard({ icon, title, sub, onClick, accent }: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        background: `linear-gradient(180deg, ${C.panelRaised}, ${C.panel})`,
        border: `1px solid ${C.hairline}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 4,
        padding: "16px 14px",
        cursor: "pointer",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 3,
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 15,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: C.text,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

export function Home({ setView }: ScreenProps) {
  const system = useUnitSystem();
  return (
    <div style={{ padding: 16 }}>
      <Plate style={{ marginBottom: 22, textAlign: "center", padding: "22px 16px" }}>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 12,
            letterSpacing: "0.25em",
            color: C.green,
            marginBottom: 6,
          }}
        >
          FIELD REFERENCE
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 26,
            letterSpacing: "0.03em",
            color: C.text,
            textTransform: "uppercase",
          }}
        >
          MHE Toolkit
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
          System design calculators
        </div>
      </Plate>

      <ModuleCard
        icon={<Gauge size={20} />}
        title="Conveyor Speed / Throughput"
        sub="Belt speed ↔ unit throughput"
        accent={C.steel}
        onClick={() => setView("speed")}
      />
      <ModuleCard
        icon={<Zap size={20} />}
        title="Horsepower"
        sub="Drive HP from load, speed & incline"
        accent={C.yellow}
        onClick={() => setView("hp")}
      />
      <ModuleCard
        icon={<RotateCw size={20} />}
        title="Belt Curve Geometry"
        sub="Minimum curve width for a package"
        accent={C.gray}
        onClick={() => setView("curve")}
      />
      <ModuleCard
        icon={<Layers size={20} />}
        title="Accumulation Buffer / Time"
        sub="Buffer time from zone count & speed"
        accent={C.navy}
        onClick={() => setView("accum")}
      />
      <ModuleCard
        icon={<ChevronsRight size={20} />}
        title="Static Gapping"
        sub="Gap created by speed-up conveyors"
        accent={C.steel}
        onClick={() => setView("gap")}
      />

      <div
        style={{
          fontFamily: displayFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textMuted,
          marginTop: 4,
          marginBottom: 8,
        }}
      >
        Units
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {UNIT_SYSTEM_OPTIONS.map((t) => (
          <button
            key={t.k}
            onClick={() => switchUnitSystem(t.k)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 3,
              border: `1px solid ${system === t.k ? C.yellow : C.hairline}`,
              background: system === t.k ? "rgba(0,47,108,0.08)" : "transparent",
              color: system === t.k ? C.yellow : C.textMuted,
              fontFamily: displayFont,
              fontSize: 12,
              letterSpacing: "0.03em",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setView("reference")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: "transparent",
          border: `1px dashed ${C.hairline}`,
          borderRadius: 4,
          padding: "12px 14px",
          marginTop: 4,
          cursor: "pointer",
          color: C.textMuted,
          fontFamily: displayFont,
          fontSize: 12,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <BookOpen size={15} />
        Formula Reference
      </button>

      <InfoNote style={{ marginTop: 20 }}>
        Simplified unit-handling formulas for quick field estimates. Verify
        against manufacturer specs (CEMA method) for final design.
      </InfoNote>

      <button
        onClick={() => {
          if (window.confirm("Reset all saved calculator inputs back to defaults?")) {
            try {
              Object.keys(window.localStorage)
                .filter((k) => k.startsWith("mhe-toolkit:"))
                .forEach((k) => window.localStorage.removeItem(k));
              window.location.reload();
            } catch {
              // ignore
            }
          }
        }}
        style={{
          display: "block",
          margin: "16px auto 0",
          background: "none",
          border: "none",
          color: C.textMuted,
          fontSize: 11.5,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Reset saved inputs
      </button>
    </div>
  );
}
