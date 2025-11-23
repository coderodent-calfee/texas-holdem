import React from "react";

interface DealerChipProps {
  text?: string;        // multi-line text, can include \n or \\n
  size?: number;        // width & height in px
  color?: string;       // outer rim color
  textColor?: string;   // text color
}

export default function DealerChip({
  text = "DEALER",
  size = 60,
  color = "white",
  textColor = "black",
}: DealerChipProps) {
  const viewBoxSize = 200;
  const center = viewBoxSize / 2;
  const outerRadius = 98;
  const innerRadius = 90;

  // Handle \n and \\n
  const lines = text.replace(/\\n/g, "\n").split("\n");

  // vertical spacing between lines
  const lineHeight = 36; // adjust to taste

  // starting y coordinate for the first line, so text block is centered
  const startY = center - ((lines.length - 1) * lineHeight) / 2 + 12;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${text} chip`}
    >
            {/* Outer rim */}
      <ellipse cx={center} cy={center} rx={outerRadius} ry={outerRadius} fill="black" />

      {/* Inner white face */}
      <ellipse cx={center} cy={center} rx={innerRadius} ry={innerRadius} fill={color} />
      {/* Text */}
      <text
        x={center}
        y={startY}
        fontSize={lineHeight}
        fontWeight="bold"
        fontFamily="Arial"
        fill={textColor}
        textAnchor="middle"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={center} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
