// ChipSVG.tsx
import React from "react";

const CHIP_SIDE = 16;   // height of <rect> = true visual thickness

interface ChipSVGProps {
    size?: number;
    color?: string;
    rimColor?: string;
    stroke?: string;
    ariaLabel?: string;
    count?: number;      // number of chips in stack
    spacing?: number;    // optional user override
    stacks?: { chipCount: number; color: string, rim? : string }[];
}

export default function ChipSVG({
    size = 30,
    color = "#d33",
    rimColor,
    stroke = "rgba(0,0,0,0.12)",
    ariaLabel = "Poker chip",
    count = 1,
    spacing,
    stacks = [
        { chipCount: 1, color: "#d4af37" }, // gold
        { chipCount: 15, color: "#c0c0c0" }, // silver
        { chipCount: 25, color: "#87cefa" }, // light blue
    ],
}: ChipSVGProps) {

    const viewBoxW = 200;
    const viewBoxH = 90;
    const chipHeight = Math.round(size * 0.25);
    const stackSpacing = spacing ?? Math.round(chipHeight / 5);
    const tallest = Math.max(...stacks.map(s => s.chipCount));
    const totalStackHeight =
        chipHeight + stackSpacing * (tallest - 1);
    const uid = React.useId();

    console.log(`ChipSVG:   size ${size} chipHeight ${chipHeight} count ${count} stackSpacing ${stackSpacing} totalStackHeight ${totalStackHeight}`);




    return (

        <svg
            width={size * stacks.length}
            height={totalStackHeight}
            viewBox={`0 0 ${viewBoxW * stacks.length} ${viewBoxH}`}
            role="img"
            aria-label={ariaLabel}
            xmlns="http://www.w3.org/2000/svg"
        >
            {stacks.map((stack, stackIndex) => {
                const stackX = stackIndex * viewBoxW;

                // Calculate rim color here (copied from your original logic)
                const hex = (c: string) => c.replace("#", "");
                stack.rim = rimColor || stack.color;
                try {
                    const h = hex(stack.color);
                    if (h.length === 6) {
                        const r = parseInt(h.slice(0, 2), 16);
                        const g = parseInt(h.slice(2, 4), 16);
                        const b = parseInt(h.slice(4, 6), 16);
                        stack.rim = `rgb(${Math.round(r * 0.75)},${Math.round(
                            g * 0.75
                        )},${Math.round(b * 0.75)})`;
                    }
                } catch { }

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
                                <stop offset="0" stopColor="rgba(255,255,255,0.70)" />
                                <stop offset="0.25" stopColor="rgba(255,255,255,0.50)" />
                                <stop offset="0.6" stopColor="rgba(255,255,255,0)" />
                                <stop offset="1" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>

                            {/* Only show area below the band */}
                            <clipPath id={`bottomClip-${uid}-${stackIndex}`}>
                                <rect x={stackX} y="41.5" width="200" height="30" />
                            </clipPath>

                            <g id={`chip-${uid}-${stackIndex}`}>
                                {/* side band (the cylindrical side) - represented as a rect:
                                 draws over the _top_ of the _bottom ellipse_ */}
                                <rect x={stackX + 20} y="26" width="160" height={`${CHIP_SIDE}`}
                                    fill={`url(#bandGrad-${uid}-${stackIndex})`}
                                    stroke={stroke} strokeWidth="1"
                                />
                                {/* bottom shadow ellipse (gives the 'thickness' seen from angle) */}
                                <ellipse cx={stackX + 100} cy="42" rx="80" ry={`${CHIP_SIDE}`}
                                    fill={`url(#bandGrad-${uid}-${stackIndex})`}
                                    stroke={stroke}
                                    strokeWidth="1"
                                    clipPath={`url(#bottomClip-${uid}-${stackIndex})`}
                                />
                                {/* top ellipse (the visible 'top' face) */}
                                <ellipse cx={stackX + 100} cy="26" rx="80" ry="18"
                                    fill={stack.color}
                                    stroke={stroke}
                                    strokeWidth="1"
                                />
                                {/* slight top highlight done as a transparent white */}
                                <ellipse cx={stackX + 100} cy="25" rx="73" ry="14"
                                    fill={`url(#topHighlight-${uid}-${stackIndex})`}
                                />
                                
                                {/* inner ring for 'carved chip appearance --
                                bottom of this ellipse blends with the chip */}
                                <ellipse cx={stackX + 100} cy="26" rx="70" ry="14"
                                    fill="none"
                                    stroke={stack.color}
                                    strokeWidth="2"
                                />
                            </g>
                        </defs>

                        {Array.from({ length: stack.chipCount }).map((_, i) => {
                            const y =
                                totalStackHeight -
                                chipHeight -
                                i * stackSpacing;
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


/*

full top is 38 high 162 wide
rx="80" ry="18"


carved oval is 30 high
143 wide
*/