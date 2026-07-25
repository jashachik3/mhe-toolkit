import { C, monoFont } from "../theme";

export function DiagramLabel({ text, x, y, anchor = "middle", color = C.textMuted }) {
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
