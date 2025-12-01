// ChipSVG.tsx
import React from "react";
import {normalizeColor} from "../components/Chip";

const CHIP_SIDE = 16;
const CHIP_OVAL_H = 18;
const CHIP_OVAL_Y = 26;
const CHIP_TOTAL = CHIP_OVAL_H + CHIP_SIDE + CHIP_OVAL_H;
const CHIP_TOP_OFFSET = CHIP_OVAL_Y - CHIP_OVAL_H;

const CHIP_OVAL_W = 80;
const CHIP_W = CHIP_OVAL_W * 2;
const CHIP_STACK_GAP = 0;

const DEFAULT_RIM_COLOR_MOD = 1;


interface ChipSVGProps {
    size?: number;
    stroke?: string;
    ariaLabel?: string;
    count?: number;      // number of chips in stack
    spacing?: number;    // optional user override
    stacks?: { chipCount: number; color: string, rim?: string }[];
}

export default function ChipSVG({
    size = 30,
    stroke = "rgba(0,0,0,0.12)",
    ariaLabel = "Poker chip",
    count = 1,
    spacing,
    stacks = [
        { chipCount: 1, color: "#d4af37" }, // gold
        { chipCount: 15, color: "#c0c0c0" }, // silver
        { chipCount: 25, color: "#812c05ff" },
    ],
}: ChipSVGProps) {
    const uid = React.useId();

    const numStacks = stacks?.length ?? 1;
    const viewBoxW = numStacks * (CHIP_OVAL_W * 2) + (numStacks - 1) * CHIP_STACK_GAP;

    const tallest = Math.max(...stacks.map(s => s.chipCount));
    const totalStackHeight = CHIP_TOTAL + (tallest - 1) * CHIP_SIDE;
    const viewBoxH = totalStackHeight;
    const pixelWidth = size;
    const pixelHeight = pixelWidth * (viewBoxH / viewBoxW);

    return (
        <svg
            width={pixelWidth}
            height={pixelHeight}
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}


            role="img"
            aria-label={ariaLabel}
            xmlns="http://www.w3.org/2000/svg"
        >
            {stacks.map((stack, stackIndex) => {

                const stackX = stackIndex * CHIP_W;

                // Calculate rim color here (copied from your original logic)
                const hex = (c: string) => c.replace("#", "");
                let rim = stack.rim;

                // Only generate rim automatically if none was supplied
                if (!rim) {
                    try {
                        const raw = normalizeColor(stack.color);
                        if (!raw) {
                            rim = stack.color; // fallback
                        } else {
                            const h = raw.replace("#", "");
                            if (h.length === 6) {
                                const r = parseInt(h.slice(0, 2), 16);
                                const g = parseInt(h.slice(2, 4), 16);
                                const b = parseInt(h.slice(4, 6), 16);
                                rim = `rgb(${Math.round(r * DEFAULT_RIM_COLOR_MOD)},${Math.round(
                                    g * DEFAULT_RIM_COLOR_MOD
                                )},${Math.round(b * DEFAULT_RIM_COLOR_MOD)})`;
                            }
                        }


                        const h = stack.color.replace("#", "");
                        if (h.length === 6) {
                            const r = parseInt(h.slice(0, 2), 16);
                            const g = parseInt(h.slice(2, 4), 16);
                            const b = parseInt(h.slice(4, 6), 16);
                            rim = `rgb(${Math.round(r * DEFAULT_RIM_COLOR_MOD)},${Math.round(
                                g * DEFAULT_RIM_COLOR_MOD
                            )},${Math.round(b * DEFAULT_RIM_COLOR_MOD)})`;
                        }
                    } catch {
                        // fallback if color can't be parsed
                        rim = stack.color;
                    }
                }

                stack.rim = rim;


                return (
                    <g key={stackIndex}>
                        <defs>
                            <linearGradient
                                id={`bandGrad-${uid}-${stackIndex}`}
                                x1="0" y1="0" x2="0" y2={String(viewBoxH)}
                            >
                                <stop offset="0" stopColor={stack.color} />
                                <stop offset="1" stopColor={stack.rim} />
                            </linearGradient>
                            {/* slight top highlight done as a transparent white */}
                            <linearGradient id={`topHighlight-${uid}-${stackIndex}`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stopColor="rgba(255,255,255,0.80)" />
                                <stop offset="0.25" stopColor="rgba(255,255,255,0.55)" />
                                <stop offset="0.6" stopColor="rgba(255,255,255,0)" />
                                <stop offset="1" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>

                            {/* Only show area below the band */}
                            <clipPath id={`bottomClip-${uid}-${stackIndex}`}>
                                <rect x={stackX} y="40" width="200" height="30" />
                            </clipPath>

                            <g id={`chip-${uid}-${stackIndex}`}>
                                {/* side band (the cylindrical side) - represented as a rect:
                                 draws over the _top_ of the _bottom ellipse_ */}
                                <rect x={stackX + CHIP_STACK_GAP} y={`${CHIP_OVAL_Y}`} width={`${CHIP_W}`} height={`${CHIP_SIDE}`}
                                    fill={`url(#bandGrad-${uid}-${stackIndex})`}
                                    stroke={stack.rim} strokeWidth="2"
                                />
                                {/* bottom shadow ellipse (gives the 'thickness' seen from angle) */}
                                <ellipse cx={stackX + CHIP_OVAL_W + CHIP_STACK_GAP} cy={`${CHIP_OVAL_Y + CHIP_SIDE}`} rx={`${CHIP_OVAL_W}`} ry={`${CHIP_OVAL_H}`}
                                    fill={`url(#bandGrad-${uid}-${stackIndex})`}
                                    stroke={stack.rim}
                                    strokeWidth="2"
                                    clipPath={`url(#bottomClip-${uid}-${stackIndex})`}
                                />
                                {/* top ellipse (the visible 'top' face) */}
                                <ellipse cx={stackX + CHIP_OVAL_W + CHIP_STACK_GAP} cy={`${CHIP_OVAL_Y}`} rx={`${CHIP_OVAL_W}`} ry={`${CHIP_OVAL_H}`}
                                    fill={stack.color}
                                    stroke={stack.rim}
                                    strokeWidth="2"
                                />
                                {/* slight top highlight done as a transparent white */}
                                <ellipse cx={stackX + CHIP_OVAL_W + CHIP_STACK_GAP} cy="25" rx="73" ry="14"
                                    fill={`url(#topHighlight-${uid}-${stackIndex})`}
                                />

                                {/* inner ring for 'carved chip appearance --
                                bottom of this ellipse blends with the chip */}
                                <ellipse cx={stackX + CHIP_OVAL_W + CHIP_STACK_GAP} cy="26" rx="70" ry="14"
                                    fill="none"
                                    stroke={stack.color}
                                    strokeWidth="2"
                                />
                            </g>
                        </defs>
                        {Array.from({ length: stack.chipCount }).map((_, i) => {
                            const bottomY = viewBoxH - (CHIP_TOTAL - CHIP_TOP_OFFSET) - CHIP_SIDE;
                            const y = (bottomY - i * CHIP_SIDE);
                            return (
                                <use
                                    key={i}
                                    href={`#chip-${uid}-${stackIndex}`}
                                    x="0"
                                    y={y}
                                />
                            );
                        })}
                    </g>
                );
            })}
        </svg>
    );
}

