import { useMemo } from "react";
import { usePersistentState } from "../lib/storage";
import { useUnitSystem } from "../lib/unitSystem";
import { toImperial, displayResult, unitLabel } from "../lib/units";
import { calcCurveWidth } from "../calculators/curveGeometry";
import { C, monoFont } from "../theme";
import type { ScreenProps } from "../lib/routing";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";
import { Field } from "../components/Field";
import { Readout } from "../components/Readout";
import { InfoNote } from "../components/InfoNote";
import { CurveDiagram } from "../diagrams/CurveDiagram";

export function CurveCalc({ setView }: ScreenProps) {
  const [pkgLength, setPkgLength] = usePersistentState("curve.pkgLength", "20");
  const [pkgWidth, setPkgWidth] = usePersistentState("curve.pkgWidth", "14");
  const [insideRadius, setInsideRadius] = usePersistentState("curve.insideRadius", "24");
  const [clearance, setClearance] = usePersistentState("curve.clearance", "1.5");
  const system = useUnitSystem();

  const result = useMemo(() => {
    const raw = calcCurveWidth({
      pkgLength: toImperial(pkgLength, "length_in", system),
      pkgWidth: toImperial(pkgWidth, "length_in", system),
      insideRadius: toImperial(insideRadius, "length_in", system),
      clearance: toImperial(clearance, "length_in", system),
    });
    if (!raw) return null;
    return {
      // raw number (not display-formatted) for the diagram's internal
      // scaling math, which needs it in the same unit as the other
      // (already current-system) dimensions passed to it
      bwForDiagram: parseFloat(displayResult(raw.bw, "length_in", system, 3)),
      bwDisplay: displayResult(raw.bw, "length_in", system, 1),
      bwGeometric: displayResult(raw.bwGeometric, "length_in", system, 1),
      clearance: displayResult(raw.clearance, "length_in", system, 1),
      r2: displayResult(raw.r2, "length_in", system, 1),
    };
  }, [pkgLength, pkgWidth, insideRadius, clearance, system]);

  return (
    <div>
      <Header title="Belt Curve Geometry" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Package Length"
            kind="length_in"
            value={pkgLength}
            onChange={setPkgLength}
            hint="Dimension in the direction of travel"
          />
          <Field
            label="Package Width"
            kind="length_in"
            value={pkgWidth}
            onChange={setPkgWidth}
            hint="Dimension across the belt"
          />
          <Field
            label="Inside Radius"
            kind="length_in"
            value={insideRadius}
            onChange={setInsideRadius}
            hint="Radius to the inside curve frame"
          />
          <Field
            label="Clearance / Safety Margin"
            kind="length_in"
            value={clearance}
            onChange={setClearance}
            hint="Added buffer beyond the calculated geometric minimum — set to your own standard or curve vendor's spec"
          />
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <CurveDiagram
            length={pkgLength}
            width={pkgWidth}
            insideRadius={insideRadius}
            bw={result ? result.bwForDiagram : 0}
            lengthUnit={unitLabel("length_in", system)}
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <Readout label="Minimum Curve Width" value={result.bwDisplay} unit={unitLabel("length_in", system)} big />
              <div style={{ fontFamily: monoFont, fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                {result.bwGeometric} {unitLabel("length_in", system)} geometric + {result.clearance} {unitLabel("length_in", system)} clearance
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.hairline}`,
                }}
              >
                <Readout label="Required Outside Radius" value={result.r2} unit={unitLabel("length_in", system)} />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>

        <InfoNote>
          BW = √(R1² + L²) − R1 + W + clearance. The geometric term assumes
          the package enters the curve oriented lengthwise with its leading
          inside corner riding the inside rail — this is a simplified
          engineering approximation, not an exact swept-path calculation.
          The clearance term is a user-set buffer; confirm the right value
          for your equipment against your curve manufacturer's spec, since
          this isn't a figure we've independently verified against a
          published CEMA standard.
        </InfoNote>
      </div>
    </div>
  );
}
