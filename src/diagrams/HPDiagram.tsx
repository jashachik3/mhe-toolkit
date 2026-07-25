import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

interface HPDiagramProps {
  length: string;
  beltWidth: string;
  angle: string;
  loadPerFoot: string;
  speed: string;
  lengthUnit?: string;
  widthUnit?: string;
  loadUnit?: string;
  speedUnit?: string;
}

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
}: HPDiagramProps) {
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

  // L is the conveyor's length along the incline (the belt's actual
  // length, per the horsepower formula), not the horizontal run — so its
  // dimension line has to follow the belt, offset to the side, rather
  // than sit flat on the ground. A flat dimension under an inclined belt
  // would visually claim the horizontal distance equals L, which is only
  // true at 0°; at 10°, e.g., the horizontal run is L·cos(10°), a bit
  // less than L.
  const beltDx = x1 - x0,
    beltDy = y1 - y0;
  const beltPxLen = Math.hypot(beltDx, beltDy) || 1;
  const ux = beltDx / beltPxLen,
    uy = beltDy / beltPxLen;
  const dimOffset = 16; // px, perpendicular to the belt, toward the ground
  const perpX = -uy * dimOffset,
    perpY = ux * dimOffset;
  const dimX0 = x0 + perpX,
    dimY0 = y0 + perpY;
  const dimX1 = x1 + perpX,
    dimY1 = y1 + perpY;

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

      {/* length dimension — runs parallel to the belt itself (see the
          dimOffset comment above), not flat along the ground */}
      <line x1={x0} y1={y0} x2={dimX0} y2={dimY0} stroke={C.gray} strokeWidth={1} />
      <line x1={x1} y1={y1} x2={dimX1} y2={dimY1} stroke={C.gray} strokeWidth={1} />
      <line x1={dimX0} y1={dimY0} x2={dimX1} y2={dimY1} stroke={C.gray} strokeWidth={1} />
      <DiagramLabel
        text={`L = ${L} ${lengthUnit}`}
        x={(dimX0 + dimX1) / 2}
        y={(dimY0 + dimY1) / 2 + 12}
        color={C.textMuted}
      />

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
