import { C, displayFont, monoFont } from "../theme";
import { Header } from "../components/Header";
import { Plate } from "../components/Plate";

function FormulaBlock({ formula }) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.hairline}`,
        borderRadius: 3,
        padding: "10px 12px",
        fontFamily: monoFont,
        fontSize: 13,
        color: C.navy,
        marginBottom: 12,
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      {formula}
    </div>
  );
}

function VarRow({ symbol, desc }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 12.5 }}>
      <div style={{ fontFamily: monoFont, color: C.greenDim, minWidth: 62, flexShrink: 0 }}>
        {symbol}
      </div>
      <div style={{ color: C.textMuted }}>{desc}</div>
    </div>
  );
}

function ReferenceCard({ title, formulas, variables, notes }) {
  return (
    <Plate style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 15,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: C.navy,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      {formulas.map((f, i) => (
        <FormulaBlock key={i} formula={f} />
      ))}

      <div style={{ marginTop: 4, marginBottom: notes ? 12 : 0 }}>
        {variables.map((v, i) => (
          <VarRow key={i} symbol={v.symbol} desc={v.desc} />
        ))}
      </div>

      {notes && (
        <div
          style={{
            fontSize: 11.5,
            color: C.textMuted,
            lineHeight: 1.5,
            paddingTop: 10,
            borderTop: `1px solid ${C.hairline}`,
          }}
        >
          {notes}
        </div>
      )}
    </Plate>
  );
}

export function ReferenceScreen({ setView }) {
  return (
    <div>
      <Header title="Formula Reference" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <ReferenceCard
          title="Conveyor Speed / Throughput"
          formulas={["V = (T × (L + G)) / 12", "T = (V × 12) / (L + G)"]}
          variables={[
            { symbol: "V", desc: "Belt speed, ft/min" },
            { symbol: "T", desc: "Throughput, parcels/min" },
            { symbol: "L", desc: "Average parcel length, in" },
            { symbol: "G", desc: "Gap between parcels, in" },
          ]}
          notes="Assumes uniform parcel spacing at (L + G) center-to-center. Throughput shown in both parcels/min and parcels/hr in the app."
        />

        <ReferenceCard
          title="Horsepower"
          formulas={[
            "Wb = (Width/12) × Length × UnitWeight",
            "Wm = Load/ft × Length",
            "Te = Cf × (Wb + Wm) + Wm × sin(θ)",
            "HP = (Te × V) / 33,000 / Eff",
          ]}
          variables={[
            { symbol: "Wb", desc: "Belt weight, lb" },
            { symbol: "Wm", desc: "Total load on conveyor, lb" },
            { symbol: "Width", desc: "Belt width, in" },
            { symbol: "Length", desc: "Conveyor length, ft" },
            { symbol: "UnitWeight", desc: "Belt weight per sq ft, lb/ft²" },
            { symbol: "Cf", desc: "Friction factor (roller/slider bed)" },
            { symbol: "θ", desc: "Incline angle, degrees" },
            { symbol: "V", desc: "Belt speed, ft/min" },
            { symbol: "Eff", desc: "Drive efficiency, as a decimal" },
          ]}
          notes="Simplified unit-handling horsepower estimate. Validate against CEMA methodology for critical or high-incline applications."
        />

        <ReferenceCard
          title="Belt Curve Geometry"
          formulas={["BW = √(R1² + L²) − R1 + W + C", "R2 = R1 + BW"]}
          variables={[
            { symbol: "BW", desc: "Minimum curve width, in" },
            { symbol: "R1", desc: "Inside radius, in" },
            { symbol: "R2", desc: "Required outside radius, in" },
            { symbol: "L", desc: "Package length (direction of travel), in" },
            { symbol: "W", desc: "Package width (across the belt), in" },
            { symbol: "C", desc: "Clearance / safety margin, in — user-set" },
          ]}
          notes="Assumes the package enters the curve oriented lengthwise, leading inside corner riding the inside rail. A simplified engineering approximation, not an exact swept-path calculation — the geometric term isn't independently verified against a published CEMA clearance standard, so confirm your clearance value against your curve vendor's spec."
        />

        <ReferenceCard
          title="Accumulation Buffer / Time"
          formulas={["Total Length = (N × Zl) / 12", "Buffer Time = Total Length / V"]}
          variables={[
            { symbol: "N", desc: "Number of accumulation zones" },
            { symbol: "Zl", desc: "Length of each zone, in" },
            { symbol: "V", desc: "Infeed speed, ft/min" },
          ]}
          notes="Time available to fill the entire accumulation section end to end before inbound flow must stop. Assumes continuous fill at line speed and one package per zone — standard for zone-controlled accumulation."
        />

        <ReferenceCard
          title="Static Gapping"
          formulas={["Gap = Lp × (Sout / Sin − 1)"]}
          variables={[
            { symbol: "Lp", desc: "Average parcel length, in" },
            { symbol: "Sin", desc: "Input speed, ft/min — speed parcels arrive at, back-to-back" },
            { symbol: "Sout", desc: "Speed of a given gapper, ft/min" },
          ]}
          notes="Assumes each package's speed changes essentially instantly once its center of mass crosses onto a faster belt. Under that assumption, the gap after any given gapper depends only on parcel length and the input/that-gapper speed ratio — not on gapper length or how many stages the speed-up is split across — as long as speeds increase monotonically along the line. A speed decrease anywhere in the sequence means packages colliding rather than gapping."
        />
      </div>
    </div>
  );
}
