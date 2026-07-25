import { useMemo } from "react";
import { usePersistentState } from "../lib/storage";
import { useUnitSystem } from "../lib/unitSystem";
import { toImperial, displayResult, unitLabel } from "../lib/units";
import { calcSpeedThroughput, type SpeedMode, type ThroughputUnit } from "../calculators/speedThroughput";
import { C, displayFont, monoFont } from "../theme";
import type { ScreenProps } from "../lib/routing";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";
import { Field } from "../components/Field";
import { Readout } from "../components/Readout";
import { SpeedDiagram } from "../diagrams/SpeedDiagram";

const SPEED_MODE_OPTIONS: { k: SpeedMode; label: string }[] = [
  { k: "toSpeed", label: "Find Speed" },
  { k: "toThroughput", label: "Find Throughput" },
];
const THROUGHPUT_UNIT_OPTIONS: { k: ThroughputUnit; label: string }[] = [
  { k: "min", label: "Per Minute" },
  { k: "hr", label: "Per Hour" },
];

export function SpeedCalc({ setView }: ScreenProps) {
  const [mode, setMode] = usePersistentState("speed.mode", "toSpeed"); // toSpeed | toThroughput
  const [throughputUnit, setThroughputUnit] = usePersistentState("speed.throughputUnit", "min"); // min | hr, only used in toSpeed mode
  const [throughput, setThroughput] = usePersistentState("speed.throughput", "30");
  const [parcelLength, setParcelLength] = usePersistentState("speed.parcelLength", "18");
  const [gap, setGap] = usePersistentState("speed.gap", "6");
  const [speed, setSpeed] = usePersistentState("speed.speed", "65");
  const system = useUnitSystem();

  const result = useMemo(() => {
    const raw = calcSpeedThroughput({
      mode: mode as SpeedMode,
      throughput,
      throughputUnit: throughputUnit as ThroughputUnit,
      parcelLength: toImperial(parcelLength, "length_in", system),
      gap: toImperial(gap, "length_in", system),
      speed: toImperial(speed, "speed_ftmin", system),
    });
    if (!raw) return null;
    // Only the "toSpeed" result is a physical speed (ft/min); throughput
    // (parcels/min or /hr) is a dimensionless count, unaffected by system.
    if (mode === "toSpeed") {
      return {
        ...raw,
        value: displayResult(raw.value, "speed_ftmin", system, 1),
        unit: unitLabel("speed_ftmin", system).toUpperCase(),
      };
    }
    return raw;
  }, [mode, throughput, throughputUnit, parcelLength, gap, speed, system]);

  return (
    <div>
      <Header title="Speed / Throughput" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {SPEED_MODE_OPTIONS.map((t) => (
            <button
              key={t.k}
              onClick={() => setMode(t.k)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 3,
                border: `1px solid ${mode === t.k ? C.yellow : C.hairline}`,
                background: mode === t.k ? "rgba(0,47,108,0.08)" : "transparent",
                color: mode === t.k ? C.yellow : C.textMuted,
                fontFamily: displayFont,
                fontSize: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Plate style={{ marginBottom: 18 }}>
          {mode === "toSpeed" ? (
            <div>
              <Field
                label="Desired Throughput"
                unit={throughputUnit === "hr" ? "parcels/hr" : "parcels/min"}
                value={throughput}
                onChange={setThroughput}
              />
              <div style={{ display: "flex", gap: 8, marginTop: -6, marginBottom: 14 }}>
                {THROUGHPUT_UNIT_OPTIONS.map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setThroughputUnit(t.k)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 3,
                      border: `1px solid ${throughputUnit === t.k ? C.steel : C.hairline}`,
                      background: throughputUnit === t.k ? "rgba(120,190,32,0.14)" : "transparent",
                      color: throughputUnit === t.k ? C.steel : C.textMuted,
                      fontFamily: displayFont,
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Field
              label="Belt Speed"
              kind="speed_ftmin"
              value={speed}
              onChange={setSpeed}
            />
          )}
          <Field
            label="Average Parcel Length"
            kind="length_in"
            value={parcelLength}
            onChange={setParcelLength}
            hint="Length of parcel in the direction of travel"
          />
          <Field
            label="Gap Between Parcels"
            kind="length_in"
            value={gap}
            onChange={setGap}
            hint="Minimum spacing maintained between parcels"
          />
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <SpeedDiagram
            parcelLength={parcelLength}
            gap={gap}
            lengthUnit={unitLabel("length_in", system)}
            speedText={
              mode === "toSpeed"
                ? `V = ${result ? result.value : "—"} ${unitLabel("speed_ftmin", system)}`
                : `V = ${speed || "—"} ${unitLabel("speed_ftmin", system)}`
            }
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <Readout label={result.label} value={result.value} unit={result.unit} big />
              {result.extra && (
                <div style={{ fontFamily: monoFont, fontSize: 13, color: C.textMuted, marginTop: 8 }}>
                  {result.extra}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>
      </div>
    </div>
  );
}
