import { useEffect, useMemo, useDeferredValue } from "react";
import { usePersistentState, usePersistentJSON } from "../lib/storage";
import { useUnitSystem } from "../lib/unitSystem";
import { toImperial, displayResult, convertNumber, unitLabel } from "../lib/units";
import { calcGapResult, calcMonteCarloGap } from "../calculators/gapping";
import { C, displayFont, monoFont } from "../theme";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";
import { Field } from "../components/Field";
import { Readout } from "../components/Readout";
import { InfoNote } from "../components/InfoNote";
import { GapDiagram } from "../diagrams/GapDiagram";
import { Histogram } from "../diagrams/Histogram";

export function GapCalc({ setView }) {
  const [parcelLength, setParcelLength] = usePersistentState("gap.parcelLength", "24");
  const [minParcelLength, setMinParcelLength] = usePersistentState("gap.minParcelLength", "16");
  const [maxParcelLength, setMaxParcelLength] = usePersistentState("gap.maxParcelLength", "34");
  const [inputSpeed, setInputSpeed] = usePersistentState("gap.inputSpeed", "60");
  const [gapperCount, setGapperCount] = usePersistentState("gap.gapperCount", "3");
  const [gapperSpeeds, setGapperSpeeds] = usePersistentJSON("gap.gapperSpeeds", ["75", "95", "120"]);
  const system = useUnitSystem();

  // keep the speed-array length in sync with gapperCount
  useEffect(() => {
    const n = Math.max(1, Math.min(Math.round(parseFloat(gapperCount)) || 1, 8));
    setGapperSpeeds((prev) => {
      if (prev.length === n) return prev;
      if (prev.length > n) return prev.slice(0, n);
      const last = parseFloat(prev[prev.length - 1]) || 60;
      const extra = Array.from({ length: n - prev.length }, (_, i) => String(Math.round(last + (i + 1) * 20)));
      return [...prev, ...extra];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapperCount]);

  const setGapperSpeedAt = (i, val) => {
    setGapperSpeeds((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const gapResult = useMemo(() => {
    const raw = calcGapResult({
      parcelLength: toImperial(parcelLength, "length_in", system),
      inputSpeed: toImperial(inputSpeed, "speed_ftmin", system),
      gapperSpeeds: gapperSpeeds.map((s) => toImperial(s, "speed_ftmin", system)),
    });
    if (!raw) return null;
    return {
      ...raw,
      gap: displayResult(raw.gap, "length_in", system, 1),
      stepGaps: raw.stepGaps.map((g) => displayResult(g, "length_in", system, 1)),
    };
  }, [parcelLength, inputSpeed, gapperSpeeds, system]);

  // Deferred so the 10k-sample simulation below doesn't block keystrokes in
  // the fields above — it catches up a beat behind the more urgent inputs.
  const deferredMinParcelLength = useDeferredValue(minParcelLength);
  const deferredParcelLength = useDeferredValue(parcelLength);
  const deferredMaxParcelLength = useDeferredValue(maxParcelLength);
  const deferredInputSpeed = useDeferredValue(inputSpeed);
  const deferredGapperSpeeds = useDeferredValue(gapperSpeeds);

  const monteCarlo = useMemo(() => {
    const raw = calcMonteCarloGap({
      minParcelLength: toImperial(deferredMinParcelLength, "length_in", system),
      parcelLength: toImperial(deferredParcelLength, "length_in", system),
      maxParcelLength: toImperial(deferredMaxParcelLength, "length_in", system),
      inputSpeed: toImperial(deferredInputSpeed, "speed_ftmin", system),
      gapperSpeeds: deferredGapperSpeeds.map((s) => toImperial(s, "speed_ftmin", system)),
    });
    if (!raw) return null;
    const cn = (n) => convertNumber(n, "length_in", system);
    return {
      ...raw,
      bins: raw.bins.map(cn),
      mean: cn(raw.mean),
      stdDev: cn(raw.stdDev),
      min: cn(raw.min),
      max: cn(raw.max),
      p5: cn(raw.p5),
    };
  }, [deferredMinParcelLength, deferredParcelLength, deferredMaxParcelLength, deferredInputSpeed, deferredGapperSpeeds, system]);

  return (
    <div>
      <Header title="Static Gapping" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Average / Most Likely Parcel Length"
            kind="length_in"
            value={parcelLength}
            onChange={setParcelLength}
            hint="Used directly for the single Gap Created result below"
          />
          <Field
            label="Min Parcel Length"
            kind="length_in"
            value={minParcelLength}
            onChange={setMinParcelLength}
          />
          <Field
            label="Max Parcel Length"
            kind="length_in"
            value={maxParcelLength}
            onChange={setMaxParcelLength}
          />
          <Field
            label="Input Speed"
            kind="speed_ftmin"
            value={inputSpeed}
            onChange={setInputSpeed}
            hint="Speed parcels arrive at, back-to-back, before gapper 1"
          />
          <Field
            label="Number of Gappers"
            unit="count"
            value={gapperCount}
            onChange={setGapperCount}
          />

          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textMuted,
                marginBottom: 8,
              }}
            >
              Gapper Speeds
            </div>
            {gapperSpeeds.map((s, i) => (
              <Field
                key={i}
                label={`Gapper ${i + 1} Speed`}
                kind="speed_ftmin"
                value={s}
                onChange={(val) => setGapperSpeedAt(i, val)}
              />
            ))}
          </div>
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <GapDiagram
            parcelLength={parcelLength}
            inputSpeed={inputSpeed}
            stageSpeeds={gapperSpeeds}
            gapText={gapResult ? gapResult.gap : "—"}
            valid={gapResult ? gapResult.valid : true}
            lengthUnit={unitLabel("length_in", system)}
            speedUnit={unitLabel("speed_ftmin", system)}
          />
        </Plate>

        <Plate>
          {gapResult ? (
            <>
              <Readout label="Gap Created" value={gapResult.gap} unit={unitLabel("length_in", system)} big />

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.hairline}`,
                }}
              >
                <div
                  style={{
                    fontFamily: displayFont,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: C.textMuted,
                    marginBottom: 8,
                  }}
                >
                  Gap After Each Gapper
                </div>
                {gapResult.stepGaps.map((g, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: monoFont,
                      fontSize: 13,
                      color: i === gapResult.stepGaps.length - 1 ? C.navy : C.textMuted,
                      padding: "4px 0",
                    }}
                  >
                    <span>After Gapper {i + 1}</span>
                    <span>{g} {unitLabel("length_in", system)}</span>
                  </div>
                ))}
              </div>

              {!gapResult.valid && (
                <div style={{ fontSize: 12, color: C.warn, marginTop: 10 }}>
                  ⚠ One or more gapper speeds is lower than the stage before it — packages would collide, not gap. Check your speed sequence.
                </div>
              )}
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 15,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: C.navy,
              marginBottom: 4,
            }}
          >
            Gap Distribution
          </div>
          <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 14 }}>
            Monte Carlo — {monteCarlo ? monteCarlo.sampleCount.toLocaleString() : "N"} parcels sampled from a triangular distribution (min/most likely/max), gap measured after the final gapper
          </div>

          {monteCarlo ? (
            <>
              <Histogram
                bins={monteCarlo.bins}
                counts={monteCarlo.counts}
                meanValue={monteCarlo.mean}
                unit={` ${unitLabel("length_in", system)}`}
              />

              <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
                <Readout label="Mean Gap" value={monteCarlo.mean.toFixed(1)} unit={unitLabel("length_in", system)} />
                <Readout label="Std Dev" value={monteCarlo.stdDev.toFixed(1)} unit={unitLabel("length_in", system)} />
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
                <Readout label="Worst Case (min)" value={monteCarlo.min.toFixed(1)} unit={unitLabel("length_in", system)} />
                <Readout label="5th Percentile" value={monteCarlo.p5.toFixed(1)} unit={unitLabel("length_in", system)} />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>
              Enter valid min/average/max parcel lengths above (min ≤ average ≤ max)
            </div>
          )}
        </Plate>

        <InfoNote>
          Gap = Parcel Length × (Gapper Speed / Input Speed − 1). Assumes
          each package's speed changes essentially instantly once its
          center of mass crosses onto a faster belt. Under that
          assumption, the final gap depends only on parcel length and the
          input/output speed ratio — not on gapper length or how many
          stages you split the speed-up across — as long as speeds
          increase monotonically along the line. A speed decrease
          anywhere in the sequence means packages colliding rather than
          gapping. The distribution below models parcel length as a
          triangular distribution (min, most likely, max) — a standard
          choice when you only have a 3-point estimate rather than real
          measured data. Swap in your own data if you have it and want a
          more accurate spread.
        </InfoNote>
      </div>
    </div>
  );
}
