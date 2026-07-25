import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

export function GapDiagram({ parcelLength, inputSpeed, stageSpeeds, gapText, valid, lengthUnit = "in", speedUnit = "ft/min" }) {
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
      <DiagramLabel text={`Back-to-back @ ${inputSpeed || "—"} ${speedUnit}`} x={20} y={16} anchor="start" color={C.textMuted} />
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
      <DiagramLabel text={truncatedStages ? `${stageSpeeds.length} gappers, speeds ${speedUnit}` : `gapper speeds, ${speedUnit}`} x={stripX + stripW / 2} y={stripY - 6} color={C.textMuted} />

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
        text={valid ? `${gapText} ${lengthUnit} gap` : `${gapText} ${lengthUnit} gap (check speeds)`}
        x={(afterX1 + boxW + afterX2 - boxW) / 2}
        y={afterY + boxH + 24}
        color={valid ? C.greenDim : C.warn}
      />
    </svg>
  );
}
