import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

interface SpeedDiagramProps {
  parcelLength: string;
  gap: string;
  lengthUnit?: string;
  speedText: string;
}

export function SpeedDiagram({ parcelLength, gap, lengthUnit = "in", speedText }: SpeedDiagramProps) {
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

  const positions: number[] = [];
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
      <DiagramLabel text={`${len} ${lengthUnit}`} x={positions[0] + boxW / 2} y={beltY - boxH - 20} color={C.greenDim} />

      {/* gap dimension between parcel 1 and 2 — its own row above the
          length dimension (a stacked-dimension-line drafting convention)
          so the two labels never collide, regardless of unit text length */}
      {n > 1 && (
        <>
          <line x1={positions[0] + boxW} y1={beltY - boxH - 28} x2={positions[1]} y2={beltY - boxH - 28} stroke={C.gray} strokeWidth={1} strokeDasharray="2,2" />
          <DiagramLabel text={`${g} ${lengthUnit}`} x={positions[0] + boxW + gapW / 2} y={beltY - boxH - 36} color={C.gray} />
        </>
      )}

      {/* direction + speed */}
      <line x1={beltEndX - 80} y1={beltY + 34} x2={beltEndX - 14} y2={beltY + 34} stroke={C.navy} strokeWidth={2} markerEnd="url(#speedArrowHead)" />
      <DiagramLabel text={speedText} x={beltEndX - 47} y={beltY + 48} color={C.navy} />
    </svg>
  );
}
