import { C, monoFont } from "../theme";

interface DiagramLabelProps {
  text: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  color?: string;
}

export function DiagramLabel({ text, x, y, anchor = "middle", color = C.textMuted }: DiagramLabelProps) {
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
