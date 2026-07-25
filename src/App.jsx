import React, { useState, useMemo } from "react";
import { ArrowLeft, Gauge, Zap, Info, RotateCw } from "lucide-react";

// ---------- Design tokens (LogistiQ brand palette) ----------
const C = {
  bg: "#F2F4F5",
  panel: "#FFFFFF",
  panelRaised: "#FFFFFF",
  hairline: "#DCE0E2",
  text: "#0F2138",
  textMuted: "#75797C",
  navy: "#002F6C",
  green: "#78BE20",
  greenDim: "#5A9017",
  gray: "#888B8D",
  warn: "#C24A3B",
};
// Back-compat aliases so the rest of the component tree (written against
// the old dark-theme token names) picks up the new brand colors.
C.yellow = C.navy;
C.yellowDim = C.greenDim;
C.steel = C.green;

const displayFont = "'Verdana', 'Azo Sans', system-ui, sans-serif";
const monoFont =
  "ui-monospace, 'SF Mono', 'Roboto Mono', 'Courier New', monospace";
const bodyFont =
  "'Verdana', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

// Rivet corner decoration for "spec plate" panels
function Rivets() {
  const dot = {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#C7CBCD",
    boxShadow: "inset 0 1px 1px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.6)",
  };
  return (
    <>
      <div style={{ ...dot, top: 8, left: 8 }} />
      <div style={{ ...dot, top: 8, right: 8 }} />
      <div style={{ ...dot, bottom: 8, left: 8 }} />
      <div style={{ ...dot, bottom: 8, right: 8 }} />
    </>
  );
}

function Plate({ children, style }) {
  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${C.panelRaised}, ${C.panel})`,
        border: `1px solid ${C.hairline}`,
        borderRadius: 4,
        padding: "18px 16px",
        boxShadow: "0 1px 2px rgba(15,33,56,0.06), 0 4px 12px rgba(15,33,56,0.05)",
        ...style,
      }}
    >
      <Rivets />
      {children}
    </div>
  );
}

function Field({ label, unit, value, onChange, step = "any", hint }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: C.bg,
            border: `1px solid ${C.hairline}`,
            borderRight: unit ? "none" : `1px solid ${C.hairline}`,
            borderRadius: unit ? "3px 0 0 3px" : 3,
            color: C.text,
            fontFamily: monoFont,
            fontSize: 16,
            padding: "10px 12px",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.yellow)}
          onBlur={(e) => (e.target.style.borderColor = C.hairline)}
        />
        {unit && (
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
            {unit}
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

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
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
    </label>
  );
}

function Readout({ label, value, unit, big }) {
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

// ---------- Diagrams ----------
function DiagramLabel({ text, x, y, anchor = "middle", color = C.textMuted }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      textAnchor={anchor}
      fill={color}
      fontFamily={monoFont}
    >
      {text}
    </text>
  );
}

function SpeedDiagram({ parcelLength, gap, speedText }) {
  const len = Math.max(parseFloat(parcelLength) || 0, 0.1);
  const g = Math.max(parseFloat(gap) || 0, 0);
  const n = 3;
  const totalUnits = n * len + (n - 1) * g;
  const availableWidth = 220;
  const scale = totalUnits > 0 ? availableWidth / totalUnits : 1;
  const boxW = Math.max(len * scale, 6);
  const gapW = Math.max(g * scale, g > 0 ? 2 : 0);
  const boxH = 30;
  const beltY = 92;
  const startX = 30;

  const positions = [];
  let x = startX;
  for (let i = 0; i < n; i++) {
    positions.push(x);
    x += boxW + gapW;
  }
  const beltEndX = positions[n - 1] + boxW + 22;

  return (
    <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <marker id="speedArrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={C.navy} />
        </marker>
      </defs>

      {/* belt */}
      <line x1={12} y1={beltY} x2={beltEndX} y2={beltY} stroke={C.gray} strokeWidth={2} />
      <circle cx={12} cy={beltY} r={6} fill="#FFFFFF" stroke={C.navy} strokeWidth={2} />
      <circle cx={beltEndX} cy={beltY} r={6} fill="#FFFFFF" stroke={C.navy} strokeWidth={2} />
      <line x1={12} y1={beltY + 6} x2={12} y2={beltY + 20} stroke={C.gray} strokeWidth={2} />
      <line x1={beltEndX} y1={beltY + 6} x2={beltEndX} y2={beltY + 20} stroke={C.gray} strokeWidth={2} />

      {/* parcels */}
      {positions.map((px, i) => (
        <rect
          key={i}
          x={px}
          y={beltY - boxH}
          width={boxW}
          height={boxH}
          fill="rgba(0,47,108,0.06)"
          stroke={C.navy}
          strokeWidth={2}
          rx={2}
        />
      ))}

      {/* length dimension on first parcel */}
      <line x1={positions[0]} y1={beltY - boxH - 12} x2={positions[0] + boxW} y2={beltY - boxH - 12} stroke={C.green} strokeWidth={1.2} />
      <line x1={positions[0]} y1={beltY - boxH - 16} x2={positions[0]} y2={beltY - boxH - 8} stroke={C.green} strokeWidth={1.2} />
      <line x1={positions[0] + boxW} y1={beltY - boxH - 16} x2={positions[0] + boxW} y2={beltY - boxH - 8} stroke={C.green} strokeWidth={1.2} />
      <DiagramLabel text={`${len}"`} x={positions[0] + boxW / 2} y={beltY - boxH - 20} color={C.greenDim} />

      {/* gap dimension between parcel 1 and 2 */}
      {n > 1 && (
        <>
          <line x1={positions[0] + boxW} y1={beltY - boxH - 12} x2={positions[1]} y2={beltY - boxH - 12} stroke={C.gray} strokeWidth={1} strokeDasharray="2,2" />
          <DiagramLabel text={`${g}"`} x={positions[0] + boxW + gapW / 2} y={beltY - boxH - 20} color={C.gray} />
        </>
      )}

      {/* direction + speed */}
      <line x1={beltEndX - 80} y1={beltY + 34} x2={beltEndX - 14} y2={beltY + 34} stroke={C.navy} strokeWidth={2} markerEnd="url(#speedArrowHead)" />
      <DiagramLabel text={speedText} x={beltEndX - 47} y={beltY + 48} color={C.navy} />
    </svg>
  );
}

function HPDiagram({ length, beltWidth, angle, loadPerFoot, speed }) {
  const L = parseFloat(length) || 0;
  const bw = parseFloat(beltWidth) || 0;
  const ang = parseFloat(angle) || 0;
  const lf = parseFloat(loadPerFoot) || 0;
  const spd = parseFloat(speed) || 0;

  const visualAngle = Math.max(0, Math.min(ang, 25));
  const rad = (visualAngle * Math.PI) / 180;
  const runLength = 210;
  const rise = runLength * Math.tan(rad);

  const x0 = 32,
    y0 = 118;
  const x1 = x0 + runLength,
    y1 = y0 - rise;

  return (
    <svg viewBox="0 0 300 165" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* ground */}
      <line x1={10} y1={130} x2={282} y2={130} stroke={C.hairline} strokeWidth={1} />
      {/* legs */}
      <line x1={x0} y1={y0} x2={x0} y2={130} stroke={C.gray} strokeWidth={2} />
      <line x1={x1} y1={y1} x2={x1} y2={130} stroke={C.gray} strokeWidth={2} />
      {/* belt */}
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.navy} strokeWidth={3} />
      <circle cx={x0} cy={y0} r={6} fill="#FFFFFF" stroke={C.navy} strokeWidth={2} />
      <circle cx={x1} cy={y1} r={6} fill="#FFFFFF" stroke={C.navy} strokeWidth={2} />

      {/* motor at discharge */}
      <rect x={x1 - 8} y={y1 - 24} width={16} height={13} fill={C.green} rx={2} />
      <DiagramLabel text="MOTOR" x={x1} y={y1 - 29} color={C.textMuted} />

      {/* load boxes along belt */}
      {[0.22, 0.5, 0.78].map((t, i) => {
        const bx = x0 + (x1 - x0) * t;
        const by = y0 + (y1 - y0) * t;
        return (
          <rect
            key={i}
            x={bx - 10}
            y={by - 15}
            width={20}
            height={13}
            fill="rgba(120,190,32,0.12)"
            stroke={C.green}
            strokeWidth={1.4}
            rx={1}
            transform={`rotate(${-visualAngle} ${bx} ${by})`}
          />
        );
      })}

      {/* length dimension */}
      <line x1={x0} y1={140} x2={x1} y2={140} stroke={C.gray} strokeWidth={1} />
      <line x1={x0} y1={136} x2={x0} y2={144} stroke={C.gray} strokeWidth={1} />
      <line x1={x1} y1={136} x2={x1} y2={144} stroke={C.gray} strokeWidth={1} />
      <DiagramLabel text={`L = ${L} ft`} x={(x0 + x1) / 2} y={155} color={C.textMuted} />

      {/* angle label */}
      <DiagramLabel text={`${ang}°`} x={x0 + 26} y={y0 - 10} anchor="start" color={C.navy} />

      {/* speed label along belt */}
      <DiagramLabel text={`V = ${spd || "—"} ft/min`} x={(x0 + x1) / 2} y={(y0 + y1) / 2 - 16} color={C.navy} />

      {/* width + load callouts */}
      <DiagramLabel text={`Width: ${bw || "—"} in`} x={12} y={16} anchor="start" color={C.textMuted} />
      <DiagramLabel text={`Load: ${lf || "—"} lb/ft`} x={12} y={30} anchor="start" color={C.textMuted} />
    </svg>
  );
}

function CurveDiagram({ length, width, insideRadius, bw }) {
  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const R1 = parseFloat(insideRadius) || 0;
  const BW = bw || 0;

  const scale = Math.min(130 / Math.max(L, 8), 95 / Math.max(W, 8), 10);
  const L_px = L * scale;
  const W_px = W * scale;
  const r1_px = Math.max(R1 * scale, 20);
  const r2_px = r1_px + BW * scale;

  const pivotX = 50,
    pivotY = 210;
  const cx = pivotX,
    cy = pivotY + r1_px;

  const arcLenPx = L_px + 70;
  const sweepDeg = Math.min((arcLenPx / r1_px) * (180 / Math.PI), 68);

  const pt = (r, angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
  };

  const insideStart = pt(r1_px, 0);
  const insideEnd = pt(r1_px, sweepDeg);
  const outsideStart = pt(r2_px, 0);
  const outsideEnd = pt(r2_px, sweepDeg);

  const trailOutside = { x: pivotX + L_px, y: pivotY - W_px };

  const insideArcPath = `M ${insideStart.x} ${insideStart.y} A ${r1_px} ${r1_px} 0 0 1 ${insideEnd.x} ${insideEnd.y}`;
  const outsideArcPath = `M ${outsideStart.x} ${outsideStart.y} A ${r2_px} ${r2_px} 0 0 1 ${outsideEnd.x} ${outsideEnd.y}`;

  return (
    <svg viewBox="0 0 340 300" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* inside / outside rails */}
      <path d={insideArcPath} fill="none" stroke={C.gray} strokeWidth={2} />
      <path d={outsideArcPath} fill="none" stroke={C.gray} strokeWidth={2} />

      {/* radial end caps */}
      <line x1={insideStart.x} y1={insideStart.y} x2={outsideStart.x} y2={outsideStart.y} stroke={C.hairline} strokeWidth={1} strokeDasharray="2,2" />
      <line x1={insideEnd.x} y1={insideEnd.y} x2={outsideEnd.x} y2={outsideEnd.y} stroke={C.hairline} strokeWidth={1} strokeDasharray="2,2" />

      {/* package, entering the curve, leading corner on inside rail */}
      <rect x={pivotX} y={pivotY - W_px} width={L_px} height={W_px} fill="rgba(0,47,108,0.07)" stroke={C.navy} strokeWidth={2} rx={2} />

      {/* pivot marker: leading-inside corner riding the inside rail */}
      <circle cx={pivotX} cy={pivotY} r={3.5} fill={C.green} />

      {/* dashed sweep line to the critical far corner */}
      <line x1={pivotX} y1={pivotY} x2={trailOutside.x} y2={trailOutside.y} stroke={C.green} strokeWidth={1.2} strokeDasharray="3,2" />

      {/* dimension labels */}
      <DiagramLabel text={`L = ${L}"`} x={pivotX + L_px / 2} y={pivotY + 18} color={C.textMuted} />
      <DiagramLabel text={`W = ${W}"`} x={pivotX - 8} y={pivotY - W_px / 2} anchor="end" color={C.textMuted} />
      <DiagramLabel text={`R1 = ${R1}"`} x={insideStart.x + 6} y={insideStart.y + 18} anchor="start" color={C.gray} />
      <DiagramLabel text={`BW = ${BW.toFixed(1)}"`} x={outsideStart.x + 6} y={outsideStart.y - 6} anchor="start" color={C.greenDim} />
    </svg>
  );
}

function Header({ title, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "16px 16px 14px",
        borderBottom: `1px solid ${C.hairline}`,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: C.textMuted,
            display: "flex",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 19,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: C.text,
        }}
      >
        {title}
      </div>
    </div>
  );
}

// ---------- Home ----------
function ModuleCard({ icon, title, sub, onClick, accent }) {
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

function Home({ setView }) {
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

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          marginTop: 20,
          padding: 12,
          background: "#EBEEF0",
          border: `1px solid ${C.hairline}`,
          borderRadius: 4,
        }}
      >
        <Info size={14} color={C.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
          Simplified unit-handling formulas for quick field estimates. Verify
          against manufacturer specs (CEMA method) for final design.
        </div>
      </div>
    </div>
  );
}

// ---------- Speed / Throughput ----------
function SpeedCalc({ setView }) {
  const [mode, setMode] = useState("toSpeed"); // toSpeed | toThroughput
  const [throughputUnit, setThroughputUnit] = useState("min"); // min | hr, only used in toSpeed mode
  const [throughput, setThroughput] = useState("30");
  const [parcelLength, setParcelLength] = useState("18");
  const [gap, setGap] = useState("6");
  const [speed, setSpeed] = useState("65");

  const result = useMemo(() => {
    const len = parseFloat(parcelLength); // inches
    const g = parseFloat(gap); // inches
    if (isNaN(len) || isNaN(g)) return null;
    const sp = len + g; // center-to-center spacing, inches

    if (mode === "toSpeed") {
      const tpInput = parseFloat(throughput);
      if (!tpInput || !sp) return null;
      const ppm = throughputUnit === "hr" ? tpInput / 60 : tpInput; // parcels/min
      const fpm = (ppm * sp) / 12;
      return {
        value: fpm.toFixed(1),
        unit: "FT/MIN",
        label: "Required Belt Speed",
        extra: `${ppm.toFixed(1)} parcels/min  ·  ${(ppm * 60).toFixed(0)} parcels/hr`,
      };
    } else {
      const spd = parseFloat(speed); // ft/min
      if (!spd || !sp) return null;
      const ppm = (spd * 12) / sp;
      return {
        value: ppm.toFixed(1),
        unit: "PARCELS/MIN",
        label: "Throughput",
        extra: `${(ppm * 60).toFixed(0)} parcels/hr`,
      };
    }
  }, [mode, throughput, throughputUnit, parcelLength, gap, speed]);

  return (
    <div>
      <Header title="Speed / Throughput" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { k: "toSpeed", label: "Find Speed" },
            { k: "toThroughput", label: "Find Throughput" },
          ].map((t) => (
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
                {[
                  { k: "min", label: "Per Minute" },
                  { k: "hr", label: "Per Hour" },
                ].map((t) => (
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
              unit="ft/min"
              value={speed}
              onChange={setSpeed}
            />
          )}
          <Field
            label="Average Parcel Length"
            unit="in"
            value={parcelLength}
            onChange={setParcelLength}
            hint="Length of parcel in the direction of travel"
          />
          <Field
            label="Gap Between Parcels"
            unit="in"
            value={gap}
            onChange={setGap}
            hint="Minimum spacing maintained between parcels"
          />
        </Plate>

        <Plate style={{ marginBottom: 18 }}>
          <SpeedDiagram
            parcelLength={parcelLength}
            gap={gap}
            speedText={
              mode === "toSpeed"
                ? `V = ${result ? result.value : "—"} ft/min`
                : `V = ${speed || "—"} ft/min`
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

// ---------- Horsepower ----------
const FRICTION_OPTIONS = [
  { value: "0.05", label: "Roller bed (0.05)" },
  { value: "0.10", label: "Roller bed, dirty (0.10)" },
  { value: "0.35", label: "Slider bed, low-friction UHMW (0.35)" },
  { value: "0.50", label: "Slider bed, standard (0.50)" },
];

const MOTOR_SIZES = [0.33, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50];

function HPCalc({ setView }) {
  const [conveyorLength, setConveyorLength] = useState("50");
  const [beltWidth, setBeltWidth] = useState("24");
  const [beltUnitWeight, setBeltUnitWeight] = useState("1.5");
  const [loadPerFoot, setLoadPerFoot] = useState("20");
  const [speed, setSpeed] = useState("65");
  const [angle, setAngle] = useState("0");
  const [friction, setFriction] = useState("0.10");
  const [efficiency, setEfficiency] = useState("85");

  const result = useMemo(() => {
    const L = parseFloat(conveyorLength); // ft
    const Wwidth = parseFloat(beltWidth); // in
    const Uw = parseFloat(beltUnitWeight); // lb/ft^2
    const Lf = parseFloat(loadPerFoot); // lb/ft
    const V = parseFloat(speed);
    const ang = parseFloat(angle);
    const Cf = parseFloat(friction);
    const eff = parseFloat(efficiency) / 100;
    if ([L, Wwidth, Uw, Lf, V, ang, Cf, eff].some((n) => isNaN(n)) || !eff) return null;

    const Wb = (Wwidth / 12) * L * Uw; // belt weight, lb
    const Wm = Lf * L; // total load on conveyor, lb

    const rad = (ang * Math.PI) / 180;
    const Te = Cf * (Wb + Wm) + Wm * Math.sin(rad); // lbs
    const hpRaw = (Te * V) / 33000 / eff;
    const nextMotor = MOTOR_SIZES.find((m) => m >= hpRaw) ?? MOTOR_SIZES[MOTOR_SIZES.length - 1];

    return {
      wb: Wb.toFixed(1),
      wm: Wm.toFixed(1),
      te: Te.toFixed(1),
      hpRaw: hpRaw.toFixed(2),
      motor: nextMotor,
    };
  }, [conveyorLength, beltWidth, beltUnitWeight, loadPerFoot, speed, angle, friction, efficiency]);

  return (
    <div>
      <Header title="Horsepower" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field label="Conveyor Length" unit="ft" value={conveyorLength} onChange={setConveyorLength} />
          <Field label="Belt Width" unit="in" value={beltWidth} onChange={setBeltWidth} />
          <Field
            label="Belt Unit Weight"
            unit="lb/ft²"
            value={beltUnitWeight}
            onChange={setBeltUnitWeight}
            hint="Typical: 0.75 light PVC · 1.5 medium duty · 2.5 heavy rubber"
          />
          <Field
            label="Load"
            unit="lb/ft"
            value={loadPerFoot}
            onChange={setLoadPerFoot}
            hint="Product weight per linear foot of conveyor"
          />
          <Field label="Belt Speed" unit="ft/min" value={speed} onChange={setSpeed} />
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
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                <Readout label="Belt Weight" value={result.wb} unit="lb" />
                <Readout label="Total Load" value={result.wm} unit="lb" />
              </div>
              <Readout label="Effective Tension" value={result.te} unit="lb" />
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

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginTop: 16,
            padding: 12,
            background: "#EBEEF0",
            border: `1px solid ${C.hairline}`,
            borderRadius: 4,
          }}
        >
          <Info size={14} color={C.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
            Belt wt = width × length × unit weight. Load = load/ft × length.
            HP = [Cf × (belt wt + load) + load × sin(angle)] × speed / 33,000 /
            efficiency. Simplified estimate — validate against CEMA calcs for
            critical or high-incline applications.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Belt Curve Geometry ----------
function CurveCalc({ setView }) {
  const [pkgLength, setPkgLength] = useState("20");
  const [pkgWidth, setPkgWidth] = useState("14");
  const [insideRadius, setInsideRadius] = useState("24");
  const [clearance, setClearance] = useState("1.5");

  const result = useMemo(() => {
    const L = parseFloat(pkgLength);
    const W = parseFloat(pkgWidth);
    const R1 = parseFloat(insideRadius);
    const cl = parseFloat(clearance) || 0;
    if ([L, W, R1].some((n) => isNaN(n)) || R1 <= 0) return null;

    const bwGeometric = Math.sqrt(R1 * R1 + L * L) - R1 + W;
    const bw = bwGeometric + cl;
    const r2 = R1 + bw;

    return {
      bw,
      r2: r2.toFixed(1),
      bwDisplay: bw.toFixed(1),
      bwGeometric: bwGeometric.toFixed(1),
      clearance: cl.toFixed(1),
    };
  }, [pkgLength, pkgWidth, insideRadius, clearance]);

  return (
    <div>
      <Header title="Belt Curve Geometry" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Package Length"
            unit="in"
            value={pkgLength}
            onChange={setPkgLength}
            hint="Dimension in the direction of travel"
          />
          <Field
            label="Package Width"
            unit="in"
            value={pkgWidth}
            onChange={setPkgWidth}
            hint="Dimension across the belt"
          />
          <Field
            label="Inside Radius"
            unit="in"
            value={insideRadius}
            onChange={setInsideRadius}
            hint="Radius to the inside curve frame"
          />
          <Field
            label="Clearance / Safety Margin"
            unit="in"
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
            bw={result ? result.bw : 0}
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <Readout label="Minimum Curve Width" value={result.bwDisplay} unit="in" big />
              <div style={{ fontFamily: monoFont, fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                {result.bwGeometric}" geometric + {result.clearance}" clearance
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${C.hairline}`,
                }}
              >
                <Readout label="Required Outside Radius" value={result.r2} unit="in" />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Enter values above</div>
          )}
        </Plate>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginTop: 16,
            padding: 12,
            background: "#EBEEF0",
            border: `1px solid ${C.hairline}`,
            borderRadius: 4,
          }}
        >
          <Info size={14} color={C.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
            BW = √(R1² + L²) − R1 + W + clearance. The geometric term assumes
            the package enters the curve oriented lengthwise with its leading
            inside corner riding the inside rail — this is a simplified
            engineering approximation, not an exact swept-path calculation.
            The clearance term is a user-set buffer; confirm the right value
            for your equipment against your curve manufacturer's spec, since
            this isn't a figure we've independently verified against a
            published CEMA standard.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [view, setView] = useState("home");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: bodyFont,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {view === "home" && <Home setView={setView} />}
      {view === "speed" && <SpeedCalc setView={setView} />}
      {view === "hp" && <HPCalc setView={setView} />}
      {view === "curve" && <CurveCalc setView={setView} />}
    </div>
  );
}
