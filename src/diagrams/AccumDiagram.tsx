import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

interface AccumDiagramProps {
  zoneCount: number;
  zoneLength: string;
  speed: string;
  timeText: string;
  lengthText: string;
  lengthUnit?: string;
  speedUnit?: string;
}

export function AccumDiagram({
  zoneCount,
  zoneLength,
  speed,
  timeText,
  lengthText,
  lengthUnit = "in",
  speedUnit = "ft/min",
}: AccumDiagramProps) {
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
      <DiagramLabel text={`${speed || "—"} ${speedUnit}`} x={2} y={16} anchor="start" color={C.navy} />

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
      <DiagramLabel text={`${zoneLength || "—"} ${lengthUnit}/zone`} x={startX + zoneW / 2} y={zoneBottom + 24} color={C.greenDim} />

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
