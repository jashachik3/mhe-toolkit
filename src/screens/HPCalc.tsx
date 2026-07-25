import { useMemo } from "react";
import { usePersistentState } from "../lib/storage";
import { useUnitSystem } from "../lib/unitSystem";
import { toImperial, displayResult, unitLabel } from "../lib/units";
import { calcHorsepower } from "../calculators/horsepower";
import { C } from "../theme";
import type { ScreenProps } from "../lib/routing";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";
import { Field } from "../components/Field";
import { Select, type SelectOption } from "../components/Select";
import { Readout } from "../components/Readout";
import { InfoNote } from "../components/InfoNote";
import { HPDiagram } from "../diagrams/HPDiagram";

const FRICTION_OPTIONS: SelectOption[] = [
  { value: "0.05", label: "Roller bed (0.05)" },
  { value: "0.10", label: "Roller bed, dirty (0.10)" },
  { value: "0.35", label: "Slider bed, low-friction UHMW (0.35)" },
  { value: "0.50", label: "Slider bed, standard (0.50)" },
];

export function HPCalc({ setView }: ScreenProps) {
  const [conveyorLength, setConveyorLength] = usePersistentState("hp.conveyorLength", "50");
  const [beltWidth, setBeltWidth] = usePersistentState("hp.beltWidth", "24");
  const [beltUnitWeight, setBeltUnitWeight] = usePersistentState("hp.beltUnitWeight", "1.5");
  const [loadPerFoot, setLoadPerFoot] = usePersistentState("hp.loadPerFoot", "20");
  const [speed, setSpeed] = usePersistentState("hp.speed", "65");
  const [angle, setAngle] = usePersistentState("hp.angle", "0");
  const [friction, setFriction] = usePersistentState("hp.friction", "0.10");
  const [efficiency, setEfficiency] = usePersistentState("hp.efficiency", "85");
  const system = useUnitSystem();

  const result = useMemo(() => {
    const raw = calcHorsepower({
      conveyorLength: toImperial(conveyorLength, "length_ft", system),
      beltWidth: toImperial(beltWidth, "length_in", system),
      beltUnitWeight: toImperial(beltUnitWeight, "unitweight_lbft2", system),
      loadPerFoot: toImperial(loadPerFoot, "load_lbft", system),
      speed: toImperial(speed, "speed_ftmin", system),
      angle,
      friction,
      efficiency,
    });
    if (!raw) return null;
    return {
      ...raw,
      wb: displayResult(raw.wb, "weight_lb", system, 1),
      wm: displayResult(raw.wm, "weight_lb", system, 1),
      te: displayResult(raw.te, "weight_lb", system, 1),
      // hpRaw and motor stay in HP regardless of system — HP is the
      // conventional motor-rating unit even in metric-using shops.
    };
  }, [conveyorLength, beltWidth, beltUnitWeight, loadPerFoot, speed, angle, friction, efficiency, system]);

  return (
    <div>
      <Header title="Horsepower" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field label="Conveyor Length" kind="length_ft" value={conveyorLength} onChange={setConveyorLength} />
          <Field label="Belt Width" kind="length_in" value={beltWidth} onChange={setBeltWidth} />
          <Field
            label="Belt Unit Weight"
            kind="unitweight_lbft2"
            value={beltUnitWeight}
            onChange={setBeltUnitWeight}
            hint={
              system === "metric"
                ? "Typical: 3.7 light PVC · 7.3 medium duty · 12.2 heavy rubber"
                : "Typical: 0.75 light PVC · 1.5 medium duty · 2.5 heavy rubber"
            }
          />
          <Field
            label="Load"
            kind="load_lbft"
            value={loadPerFoot}
            onChange={setLoadPerFoot}
            hint="Product weight per linear foot of conveyor"
          />
          <Field label="Belt Speed" kind="speed_ftmin" value={speed} onChange={setSpeed} />
          <Field label="Incline Angle" unit="deg" value={angle} onChange={setAngle} hint="0 for level conveyor" />
          <Select label="Friction Factor" value={friction} onChange={setFriction} options={FRICTION_OPTIONS} />
          <Field label="Drive Efficiency" unit="%" value={efficiency} onChange={setEfficiency} />
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <HPDiagram
            length={conveyorLength}
            beltWidth={beltWidth}
            angle={angle}
            loadPerFoot={loadPerFoot}
            speed={speed}
            lengthUnit={unitLabel("length_ft", system)}
            widthUnit={unitLabel("length_in", system)}
            loadUnit={unitLabel("load_lbft", system)}
            speedUnit={unitLabel("speed_ftmin", system)}
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                <Readout label="Belt Weight" value={result.wb} unit={unitLabel("weight_lb", system)} />
                <Readout label="Total Load" value={result.wm} unit={unitLabel("weight_lb", system)} />
              </div>
              <Readout label="Effective Tension" value={result.te} unit={unitLabel("weight_lb", system)} />
              <div style={{ height: 14 }} />
              <Readout label="Calculated HP" value={result.hpRaw} unit="HP" />
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.hairline}`,
                }}
              >
                <Readout label="Recommended Motor Size" value={result.motor} unit="HP" big />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>

        <InfoNote>
          Belt wt = width × length × unit weight. Load = load/ft × length.
          HP = [Cf × (belt wt + load) + load × sin(angle)] × speed / 33,000 /
          efficiency. Simplified estimate — validate against CEMA calcs for
          critical or high-incline applications.
        </InfoNote>
      </div>
    </div>
  );
}
