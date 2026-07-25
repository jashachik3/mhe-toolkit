import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

export function HPDiagram({
  length,
  beltWidth,
  angle,
  loadPerFoot,
  speed,
  lengthUnit = "ft",
  widthUnit = "in",
  loadUnit = "lb/ft",
  speedUnit = "ft/min",
}) {
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
      <DiagramLabel text={`L = ${L} ${lengthUnit}`} x={(x0 + x1) / 2} y={155} color={C.textMuted} />

      {/* angle label */}
      <DiagramLabel text={`${ang}°`} x={x0 + 26} y={y0 - 10} anchor="start" color={C.navy} />

      {/* speed label along belt */}
      <DiagramLabel text={`V = ${spd || "—"} ${speedUnit}`} x={(x0 + x1) / 2} y={(y0 + y1) / 2 - 16} color={C.navy} />

      {/* width + load callouts */}
      <DiagramLabel text={`Width: ${bw || "—"} ${widthUnit}`} x={12} y={16} anchor="start" color={C.textMuted} />
      <DiagramLabel text={`Load: ${lf || "—"} ${loadUnit}`} x={12} y={30} anchor="start" color={C.textMuted} />
    </svg>
  );
}
