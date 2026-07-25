import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Gauge, Zap, Info, RotateCw, Layers, BookOpen, ChevronsRight } from "lucide-react";

// Persists a piece of state to localStorage under a namespaced key, so
// calculator inputs survive closing and reopening the app.
function usePersistentState(key, defaultValue) {
  const fullKey = `mhe-toolkit:${key}`;
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage.getItem(fullKey);
      return stored !== null ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(fullKey, state);
    } catch {
      // localStorage unavailable (private browsing, etc.) — fail silently,
      // the calculator still works, it just won't remember inputs.
    }
  }, [fullKey, state]);

  return [state, setState];
}

// Same as usePersistentState but for arrays/objects (JSON-encoded), used for
// the per-gapper speed list which changes length as gapper count changes.
function usePersistentJSON(key, defaultValue) {
  const fullKey = `mhe-toolkit:${key}`;
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage.getItem(fullKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [fullKey, state]);

  return [state, setState];
}

// Small deterministic PRNG (mulberry32) so Monte Carlo results are
// reproducible for a given set of inputs rather than jittering on every
// re-render. Seeded from a hash of the inputs that feed the simulation.
function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Samples from a triangular distribution with min a, mode c, max b, using
// the given [0,1) random generator via inverse-CDF sampling.
function sampleTriangular(rng, a, c, b) {
  if (b <= a) return a;
  const u = rng();
  const fc = (c - a) / (b - a);
  if (u < fc) return a + Math.sqrt(u * (b - a) * (c - a));
  return b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

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

function Select({ label, value, onChange, options, hint }) {
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
      {hint && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
          {hint}
        </div>
      )}
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

function AccumDiagram({ zoneCount, zoneLength, speed, timeText, lengthText }) {
  const displayCount = Math.max(1, Math.min(Math.round(zoneCount) || 1, 10));
  const truncated = (Math.round(zoneCount) || 1) > 10;

  const startX = 24,
    endX = 296;
  const beltY = 56;
  const available = endX - startX;
  const zoneW = available / displayCount;
  const boxH = 26;
  const zoneTop = beltY - boxH / 2;
  const zoneBottom = beltY + boxH / 2;

  return (
    <svg viewBox="0 0 320 185" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* speed label, alone at the top so nothing else can collide with it */}
      <DiagramLabel text={`${speed || "—"} ft/min`} x={2} y={16} anchor="start" color={C.navy} />

      {/* infeed arrow */}
      <line x1={2} y1={beltY} x2={startX - 4} y2={beltY} stroke={C.navy} strokeWidth={2} markerEnd="url(#zoneInArrow)" />
      <defs>
        <marker id="zoneInArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={C.navy} />
        </marker>
      </defs>

      {/* zone boxes, adjacent (shared walls, like real ZPA zones) */}
      {Array.from({ length: displayCount }).map((_, i) => {
        const x = startX + i * zoneW;
        return (
          <rect
            key={i}
            x={x}
            y={zoneTop}
            width={zoneW}
            height={boxH}
            fill={i % 2 === 0 ? "rgba(0,47,108,0.05)" : "rgba(120,190,32,0.06)"}
            stroke={C.gray}
            strokeWidth={1.2}
          />
        );
      })}

      {truncated && (
        <DiagramLabel text={`${Math.round(zoneCount)} zones total`} x={(startX + endX) / 2} y={beltY + 4} color={C.textMuted} />
      )}

      {/* end stop */}
      <rect x={endX} y={zoneTop - 6} width={6} height={boxH + 12} fill={C.navy} rx={1} />

      {/* zone length dimension, directly under the first zone */}
      <line x1={startX} y1={zoneBottom + 10} x2={startX + zoneW} y2={zoneBottom + 10} stroke={C.green} strokeWidth={1.2} />
      <DiagramLabel text={`${zoneLength || "—"}"/zone`} x={startX + zoneW / 2} y={zoneBottom + 24} color={C.greenDim} />

      {/* total buffer length dimension, its own row below that */}
      <line x1={startX} y1={zoneBottom + 42} x2={endX} y2={zoneBottom + 42} stroke={C.gray} strokeWidth={1} />
      <line x1={startX} y1={zoneBottom + 38} x2={startX} y2={zoneBottom + 46} stroke={C.gray} strokeWidth={1} />
      <line x1={endX} y1={zoneBottom + 38} x2={endX} y2={zoneBottom + 46} stroke={C.gray} strokeWidth={1} />
      <DiagramLabel text={lengthText} x={(startX + endX) / 2} y={zoneBottom + 56} color={C.textMuted} />

      {/* headline buffer time, its own row with clear separation */}
      <DiagramLabel text={timeText} x={(startX + endX) / 2} y={zoneBottom + 84} color={C.navy} />
    </svg>
  );
}

function Histogram({ bins, counts, meanValue, unit }) {
  const maxCount = Math.max(...counts, 1);
  const chartX = 10,
    chartW = 300,
    chartY = 14,
    chartH = 110;
  const barGap = 1.5;
  const barW = chartW / counts.length - barGap;

  const minEdge = bins[0];
  const maxEdge = bins[bins.length - 1];
  const meanX = chartX + ((meanValue - minEdge) / (maxEdge - minEdge)) * chartW;

  return (
    <svg viewBox="0 0 320 150" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* baseline */}
      <line x1={chartX} y1={chartY + chartH} x2={chartX + chartW} y2={chartY + chartH} stroke={C.hairline} strokeWidth={1} />

      {/* bars */}
      {counts.map((c, i) => {
        const h = (c / maxCount) * chartH;
        const x = chartX + i * (barW + barGap);
        return (
          <rect
            key={i}
            x={x}
            y={chartY + chartH - h}
            width={barW}
            height={h}
            fill="rgba(0,47,108,0.35)"
          />
        );
      })}

      {/* mean marker */}
      <line x1={meanX} y1={chartY - 4} x2={meanX} y2={chartY + chartH + 4} stroke={C.green} strokeWidth={1.4} strokeDasharray="3,2" />
      <DiagramLabel text={`mean ${meanValue.toFixed(1)}${unit}`} x={meanX} y={chartY - 8} color={C.greenDim} />

      {/* axis labels */}
      <DiagramLabel text={`${minEdge.toFixed(1)}${unit}`} x={chartX} y={chartY + chartH + 16} anchor="start" color={C.textMuted} />
      <DiagramLabel text={`${maxEdge.toFixed(1)}${unit}`} x={chartX + chartW} y={chartY + chartH + 16} anchor="end" color={C.textMuted} />
    </svg>
  );
}

function GapDiagram({ parcelLength, inputSpeed, stageSpeeds, gapText, valid }) {
  const Lp = Math.max(parseFloat(parcelLength) || 0, 4);
  const scale = Math.min(70 / Lp, 3.2);
  const boxW = Lp * scale;
  const boxH = 20;

  const stages = stageSpeeds.slice(0, 6); // cap displayed stage chips for readability
  const truncatedStages = stageSpeeds.length > 6;

  // "before" scene: two boxes touching
  const beforeY = 34;
  const beforeX1 = 20;
  const beforeX2 = beforeX1 + boxW;

  // gapper stage strip
  const stripY = 76;
  const stripX = 20;
  const stripW = 280;
  const chipW = stripW / Math.max(stages.length, 1);

  // "after" scene: two boxes with a gap sized relative to boxW (visually
  // exaggerated/compressed as needed so it always reads clearly)
  const gapVal = parseFloat(gapText) || 0;
  const gapPx = Math.max(Math.min(gapVal * scale, 140), 6);
  const afterY = 140;
  const afterX1 = 20;
  const afterX2 = afterX1 + boxW + gapPx;

  return (
    <svg viewBox="0 0 320 175" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* before */}
      <DiagramLabel text={`Back-to-back @ ${inputSpeed || "—"} ft/min`} x={20} y={16} anchor="start" color={C.textMuted} />
      <rect x={beforeX1} y={beforeY} width={boxW} height={boxH} fill="rgba(0,47,108,0.08)" stroke={C.navy} strokeWidth={1.6} rx={2} />
      <rect x={beforeX2} y={beforeY} width={boxW} height={boxH} fill="rgba(0,47,108,0.08)" stroke={C.navy} strokeWidth={1.6} rx={2} />

      {/* gapper stage strip */}
      {stages.map((s, i) => (
        <g key={i}>
          <rect
            x={stripX + i * chipW}
            y={stripY}
            width={chipW}
            height={22}
            fill={i % 2 === 0 ? "rgba(120,190,32,0.06)" : "rgba(0,47,108,0.05)"}
            stroke={C.gray}
            strokeWidth={1}
          />
          <DiagramLabel text={`${s || "—"}`} x={stripX + i * chipW + chipW / 2} y={stripY + 14} color={C.greenDim} />
        </g>
      ))}
      <DiagramLabel text={truncatedStages ? `${stageSpeeds.length} gappers, speeds ft/min` : "gapper speeds, ft/min"} x={stripX + stripW / 2} y={stripY - 6} color={C.textMuted} />

      {/* connecting arrow */}
      <line x1={160} y1={stripY + 34} x2={160} y2={afterY - 12} stroke={C.hairline} strokeWidth={1} strokeDasharray="2,2" />

      {/* after */}
      <rect x={afterX1} y={afterY} width={boxW} height={boxH} fill="rgba(0,47,108,0.08)" stroke={C.navy} strokeWidth={1.6} rx={2} />
      <rect x={afterX2 - boxW} y={afterY} width={boxW} height={boxH} fill="rgba(120,190,32,0.1)" stroke={C.green} strokeWidth={1.6} rx={2} />

      {/* gap dimension */}
      <line x1={afterX1 + boxW} y1={afterY + boxH + 8} x2={afterX2 - boxW} y2={afterY + boxH + 8} stroke={C.green} strokeWidth={1.2} />
      <line x1={afterX1 + boxW} y1={afterY + boxH + 4} x2={afterX1 + boxW} y2={afterY + boxH + 12} stroke={C.green} strokeWidth={1.2} />
      <line x1={afterX2 - boxW} y1={afterY + boxH + 4} x2={afterX2 - boxW} y2={afterY + boxH + 12} stroke={C.green} strokeWidth={1.2} />
      <DiagramLabel
        text={valid ? `${gapText}" gap` : `${gapText}" gap (check speeds)`}
        x={(afterX1 + boxW + afterX2 - boxW) / 2}
        y={afterY + boxH + 24}
        color={valid ? C.greenDim : C.warn}
      />
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

// ---------- Speed / Throughput ----------
function SpeedCalc({ setView }) {
  const [mode, setMode] = usePersistentState("speed.mode", "toSpeed"); // toSpeed | toThroughput
  const [throughputUnit, setThroughputUnit] = usePersistentState("speed.throughputUnit", "min"); // min | hr, only used in toSpeed mode
  const [throughput, setThroughput] = usePersistentState("speed.throughput", "30");
  const [parcelLength, setParcelLength] = usePersistentState("speed.parcelLength", "18");
  const [gap, setGap] = usePersistentState("speed.gap", "6");
  const [speed, setSpeed] = usePersistentState("speed.speed", "65");

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
  const [conveyorLength, setConveyorLength] = usePersistentState("hp.conveyorLength", "50");
  const [beltWidth, setBeltWidth] = usePersistentState("hp.beltWidth", "24");
  const [beltUnitWeight, setBeltUnitWeight] = usePersistentState("hp.beltUnitWeight", "1.5");
  const [loadPerFoot, setLoadPerFoot] = usePersistentState("hp.loadPerFoot", "20");
  const [speed, setSpeed] = usePersistentState("hp.speed", "65");
  const [angle, setAngle] = usePersistentState("hp.angle", "0");
  const [friction, setFriction] = usePersistentState("hp.friction", "0.10");
  const [efficiency, setEfficiency] = usePersistentState("hp.efficiency", "85");

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
  const [pkgLength, setPkgLength] = usePersistentState("curve.pkgLength", "20");
  const [pkgWidth, setPkgWidth] = usePersistentState("curve.pkgWidth", "14");
  const [insideRadius, setInsideRadius] = usePersistentState("curve.insideRadius", "24");
  const [clearance, setClearance] = usePersistentState("curve.clearance", "1.5");

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

// ---------- Accumulation Buffer / Time ----------
function AccumCalc({ setView }) {
  const [speed, setSpeed] = usePersistentState("accum.speed", "100");
  const [zoneLength, setZoneLength] = usePersistentState("accum.zoneLength", "24");
  const [zoneCount, setZoneCount] = usePersistentState("accum.zoneCount", "10");

  const result = useMemo(() => {
    const V = parseFloat(speed);
    const zl = parseFloat(zoneLength);
    const N = parseFloat(zoneCount);
    if ([V, zl, N].some((n) => isNaN(n)) || V <= 0 || zl <= 0 || N < 1) return null;

    const totalLengthFt = (N * zl) / 12;
    const bufferTimeMin = totalLengthFt / V;
    const bufferTimeSec = bufferTimeMin * 60;

    return {
      totalLengthFt: totalLengthFt.toFixed(1),
      bufferTimeSec: bufferTimeSec.toFixed(0),
      bufferTimeMin: bufferTimeMin.toFixed(2),
      packageCapacity: Math.floor(N),
    };
  }, [speed, zoneLength, zoneCount]);

  return (
    <div>
      <Header title="Accumulation Buffer / Time" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Infeed Speed"
            unit="ft/min"
            value={speed}
            onChange={setSpeed}
          />
          <Field
            label="Zone Length"
            unit="in"
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
            lengthText={result ? `${result.totalLengthFt} ft total` : "—"}
            timeText={result ? `${result.bufferTimeSec} sec buffer` : "—"}
          />
        </Plate>

        <Plate>
          {result ? (
            <>
              <Readout label="Buffer Time Before Inbound Must Stop" value={result.bufferTimeSec} unit="sec" big />
              <div style={{ fontFamily: monoFont, fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                {result.bufferTimeMin} min &middot; {result.totalLengthFt} ft of total accumulation
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
            Buffer Time = (Zones × Zone Length) ÷ Infeed Speed. This is the
            time available to fill the entire accumulation section end to
            end before you'd need to stop inbound flow — assumes zones fill
            continuously at line speed and one package per zone, standard
            for zone-controlled accumulation.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Static Gapping ----------
function GapCalc({ setView }) {
  const [parcelLength, setParcelLength] = usePersistentState("gap.parcelLength", "24");
  const [minParcelLength, setMinParcelLength] = usePersistentState("gap.minParcelLength", "16");
  const [maxParcelLength, setMaxParcelLength] = usePersistentState("gap.maxParcelLength", "34");
  const [inputSpeed, setInputSpeed] = usePersistentState("gap.inputSpeed", "60");
  const [gapperCount, setGapperCount] = usePersistentState("gap.gapperCount", "3");
  const [gapperSpeeds, setGapperSpeeds] = usePersistentJSON("gap.gapperSpeeds", ["75", "95", "120"]);

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
    const Lp = parseFloat(parcelLength);
    const s0 = parseFloat(inputSpeed);
    const speeds = gapperSpeeds.map((s) => parseFloat(s));
    if (isNaN(Lp) || isNaN(s0) || speeds.some((s) => isNaN(s)) || speeds.length === 0) return null;

    const sequence = [s0, ...speeds];
    let valid = true;
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] < sequence[i - 1]) valid = false;
    }

    const stepGaps = speeds.map((sN) => (Lp * (sN / s0 - 1)).toFixed(1));
    const gap = stepGaps[stepGaps.length - 1];

    return { gap, valid, stepGaps };
  }, [parcelLength, inputSpeed, gapperSpeeds]);

  const monteCarlo = useMemo(() => {
    const a = parseFloat(minParcelLength);
    const c = parseFloat(parcelLength);
    const b = parseFloat(maxParcelLength);
    const s0 = parseFloat(inputSpeed);
    const sN = parseFloat(gapperSpeeds[gapperSpeeds.length - 1]);
    if ([a, c, b, s0, sN].some((n) => isNaN(n)) || b < a || c < a || c > b || s0 <= 0) return null;

    const SAMPLE_COUNT = 4000;
    const BIN_COUNT = 18;
    const ratio = sN / s0 - 1;

    const rng = hashSeed(`${a}|${c}|${b}|${s0}|${sN}`);
    const gaps = new Array(SAMPLE_COUNT);
    let sum = 0;
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const Lp = sampleTriangular(rng, a, c, b);
      const g = Lp * ratio;
      gaps[i] = g;
      sum += g;
    }
    gaps.sort((x, y) => x - y);

    const mean = sum / SAMPLE_COUNT;
    const variance = gaps.reduce((acc, g) => acc + (g - mean) ** 2, 0) / SAMPLE_COUNT;
    const stdDev = Math.sqrt(variance);
    const min = gaps[0];
    const max = gaps[SAMPLE_COUNT - 1];
    const p5 = gaps[Math.floor(SAMPLE_COUNT * 0.05)];

    const binWidth = (max - min) / BIN_COUNT || 1;
    const bins = Array.from({ length: BIN_COUNT + 1 }, (_, i) => min + i * binWidth);
    const counts = new Array(BIN_COUNT).fill(0);
    gaps.forEach((g) => {
      let idx = Math.floor((g - min) / binWidth);
      if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
      if (idx < 0) idx = 0;
      counts[idx]++;
    });

    return { bins, counts, mean, stdDev, min, max, p5 };
  }, [minParcelLength, parcelLength, maxParcelLength, inputSpeed, gapperSpeeds]);

  return (
    <div>
      <Header title="Static Gapping" onBack={() => setView("home")} />
      <div style={{ padding: 16 }}>
        <Plate style={{ marginBottom: 18 }}>
          <Field
            label="Average / Most Likely Parcel Length"
            unit="in"
            value={parcelLength}
            onChange={setParcelLength}
            hint="Used directly for the single Gap Created result below"
          />
          <Field
            label="Min Parcel Length"
            unit="in"
            value={minParcelLength}
            onChange={setMinParcelLength}
          />
          <Field
            label="Max Parcel Length"
            unit="in"
            value={maxParcelLength}
            onChange={setMaxParcelLength}
          />
          <Field
            label="Input Speed"
            unit="ft/min"
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
                unit="ft/min"
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
          />
        </Plate>

        <Plate>
          {gapResult ? (
            <>
              <Readout label="Gap Created" value={gapResult.gap} unit="in" big />

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
                    <span>{g}{'"'}</span>
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
            Monte Carlo — 4,000 parcels sampled from a triangular distribution (min/most likely/max), gap measured after the final gapper
          </div>

          {monteCarlo ? (
            <>
              <Histogram bins={monteCarlo.bins} counts={monteCarlo.counts} meanValue={monteCarlo.mean} unit={'"'} />

              <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
                <Readout label="Mean Gap" value={monteCarlo.mean.toFixed(1)} unit="in" />
                <Readout label="Std Dev" value={monteCarlo.stdDev.toFixed(1)} unit="in" />
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
                <Readout label="Worst Case (min)" value={monteCarlo.min.toFixed(1)} unit="in" />
                <Readout label="5th Percentile" value={monteCarlo.p5.toFixed(1)} unit="in" />
              </div>
            </>
          ) : (
            <div style={{ color: C.textMuted, fontSize: 13 }}>
              Enter valid min/average/max parcel lengths above (min ≤ average ≤ max)
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Formula Reference ----------
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

function ReferenceScreen({ setView }) {
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
      {view === "accum" && <AccumCalc setView={setView} />}
      {view === "reference" && <ReferenceScreen setView={setView} />}
      {view === "gap" && <GapCalc setView={setView} />}
    </div>
  );
}
