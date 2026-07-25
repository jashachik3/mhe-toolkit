import { useMemo } from "react";
import { usePersistentState } from "../lib/storage";
import { useUnitSystem } from "../lib/unitSystem";
import { toImperial, displayResult, unitLabel } from "../lib/units";
import { calcAccumulation } from "../calculators/accumulation";
import { C, monoFont } from "../theme";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";
import { Field } from "../components/Field";
import { Readout } from "../components/Readout";
import { InfoNote } from "../components/InfoNote";
import { AccumDiagram } from "../diagrams/AccumDiagram";

export function AccumCalc({ setView }) {
  const [speed, setSpeed] = usePersistentState("accum.speed", "100");
  const [zoneLength, setZoneLength] = usePersistentState("accum.zoneLength", "24");
  const [zoneCount, setZoneCount] = usePersistentState("accum.zoneCount", "10");
  const system = useUnitSystem();

  const result = useMemo(() => {
    const raw = calcAccumulation({
      speed: toImperial(speed, "speed_ftmin", system),
      zoneLength: toImperial(zoneLength, "length_in", system),
      zoneCount,
    });
    if (!raw) return null;
    return {
      ...raw,
      // total buffer length is a physical length (converts); buffer time
      // and package capacity are time/count, unaffected by unit system
      totalLength: displayResult(raw.totalLengthFt, "length_ft", system, 1),
    };
  }, [speed, zoneLength, zoneCount, system]);

  return (
    <div>
      <Header title="Accumulation Buffer / Time" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Infeed Speed"
            kind="speed_ftmin"
            value={speed}
            onChange={setSpeed}
          />
          <Field
            label="Zone Length"
            kind="length_in"
            value={zoneLength}
            onChange={setZoneLength}
            hint="Length of each accumulation zone"
          />
          <Field
            label="Number of Zones"
            unit="count"
            value={zoneCount}
            onChange={setZoneCount}
          />
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <AccumDiagram
            zoneCount={parseFloat(zoneCount) || 1}
            zoneLength={zoneLength}
            speed={speed}
            lengthUnit={unitLabel("length_in", system)}
            speedUnit={unitLabel("speed_ftmin", system)}
            lengthText={result ? `${result.totalLength} ${unitLabel("length_ft", system)} total` : "—"}
            timeText={result ? `${result.bufferTimeSec} sec buffer` : "—"}
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <Readout label="Buffer Time Before Inbound Must Stop" value={result.bufferTimeSec} unit="sec" big />
              <div style={{ fontFamily: monoFont, fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                {result.bufferTimeMin} min &middot; {result.totalLength} {unitLabel("length_ft", system)} of total accumulation
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.hairline}`,
                }}
              >
                <Readout label="Package Capacity (1 per zone)" value={result.packageCapacity} unit="count" />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>

        <InfoNote>
          Buffer Time = (Zones × Zone Length) ÷ Infeed Speed. This is the
          time available to fill the entire accumulation section end to
          end before you'd need to stop inbound flow — assumes zones fill
          continuously at line speed and one package per zone, standard
          for zone-controlled accumulation.
        </InfoNote>
      </div>
    </div>
  );
}
