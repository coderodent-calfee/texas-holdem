import React, { useRef } from "react";
import { Pressable } from "react-native";



interface DealerChipProps {
  text?: string;        // multi-line text, can include \n or \\n
  size?: number;        // width & height in px
  color?: string;       // inner color
  rim?: string;       // outer rim color
  textColor?: string;   // text color
  lineHeight?: number;
  onPress?: () => void;               // short tap
  onHold?: () => void;                // repeated press-and-hold callback
  holdInterval?: number;              // ms between repeated calls
}

export default function DealerChip({
  text = "DEALER",
  size = 60,
  color = "white",
  textColor = "black",
  rim = "black",
  lineHeight = 36,
  onPress,
  onHold,
  holdInterval = 150,
}: DealerChipProps) {
  const viewBoxSize = 200;
  const center = viewBoxSize / 2;
  const outerRadius = 98;
  const innerRadius = 90;

  // Handle \n and \\n
  const lines = text.replace(/\\n/g, "\n").split("\n");
  // starting y coordinate for the first line, so text block is centered
  const startY = center - ((lines.length - 1) * lineHeight) / 2 + 12;


  // Hold timer
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (!onHold) return;

    // Fire first immediately
    onHold();

    // Then start interval
    holdTimer.current = setInterval(() => {
      onHold();
    }, holdInterval);
  };

  const stopHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const ChipSVG = (<svg
    width={size}
    height={size}
    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={`${text} chip`}
  >
    {/* Outer rim */}
    <ellipse cx={center} cy={center} rx={outerRadius} ry={outerRadius} fill={rim} />

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
  // If no handlers → no pressable wrapper
  if (!onPress && !onHold) {
    return ChipSVG;
  }
  // Wrap in Pressable if interactive
  return (
    <Pressable
      onPress={onPress}
      onPressIn={startHold}
      onPressOut={stopHold}
      style={{ width: size, height: size }}  // ensures Pressable matches SVG
    >
      {ChipSVG}
    </Pressable>
  );
}
