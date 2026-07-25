import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

interface CurveDiagramProps {
  length: string;
  width: string;
  insideRadius: string;
  bw: number;
  lengthUnit?: string;
}

export function CurveDiagram({ length, width, insideRadius, bw, lengthUnit = "in" }: CurveDiagramProps) {
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

  const pt = (r: number, angleDeg: number) => {
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

      {/* dimension labels — R1 sits on its own row below L (insideStart is
          the same point the L dimension starts from, so at longer unit
          strings like "cm" the two would otherwise overlap) */}
      <DiagramLabel text={`L = ${L} ${lengthUnit}`} x={pivotX + L_px / 2} y={pivotY + 18} color={C.textMuted} />
      <DiagramLabel text={`W = ${W} ${lengthUnit}`} x={pivotX - 8} y={pivotY - W_px / 2} anchor="end" color={C.textMuted} />
      <DiagramLabel text={`R1 = ${R1} ${lengthUnit}`} x={insideStart.x + 6} y={insideStart.y + 34} anchor="start" color={C.gray} />
      <DiagramLabel text={`BW = ${BW.toFixed(1)} ${lengthUnit}`} x={outsideStart.x + 6} y={outsideStart.y - 6} anchor="start" color={C.greenDim} />
    </svg>
  );
}
