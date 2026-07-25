import { C } from "../theme";
import { DiagramLabel } from "./DiagramLabel";

interface HistogramProps {
  bins: number[];
  counts: number[];
  meanValue: number;
  unit: string;
}

export function Histogram({ bins, counts, meanValue, unit }: HistogramProps) {
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
