// cards/cards.ts
// Centralized card definitions + assets + helpers

// ---------------------------------------------------------------------------
// CARD CODES (52 real cards + BACK)
// ---------------------------------------------------------------------------

export const CARD_CODES = [
    "A♠", "A♥", "A♦", "A♣",
    "K♠", "K♥", "K♦", "K♣",
    "Q♠", "Q♥", "Q♦", "Q♣",
    "J♠", "J♥", "J♦", "J♣",
    "T♠", "T♥", "T♦", "T♣",
    "9♠", "9♥", "9♦", "9♣",
    "8♠", "8♥", "8♦", "8♣",
    "7♠", "7♥", "7♦", "7♣",
    "6♠", "6♥", "6♦", "6♣",
    "5♠", "5♥", "5♦", "5♣",
    "4♠", "4♥", "4♦", "4♣",
    "3♠", "3♥", "3♦", "3♣",
    "2♠", "2♥", "2♦", "2♣",
    "1B",
] as const;

export type CardCode = (typeof CARD_CODES)[number];

// Special value for card back
export const BACK: CardCode = "1B";

// Full 52-card list excluding BACK
export const RANKED_CODES: CardCode[] = CARD_CODES.filter(
    (c) => {
        return "23456789TJQKA".includes(c[0]) && "♠♥♦♣".includes(c[1]);
    }
) as CardCode[];

// ---------------------------------------------------------------------------
// SVG CARD COMPONENTS (via webpack/metro require.context)
// ---------------------------------------------------------------------------

// Only works in React web / React Native Webpack environments.
// Must match your folder:  assets/svg/cards/*.svg
const req = require.context(
    "../../assets/svg/cards",
    false,
    /\.svg$/
);

export const cardSvgs: Record<CardCode, React.FC<React.SVGProps<SVGSVGElement>>> = {} as any;

// Maps suit letters to unicode card suits
const SUIT_MAP: Record<string, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
};

req.keys().forEach(filename => {
    const module = req(filename) as {
        default: React.FC<React.SVGProps<SVGSVGElement>>;
    };

    // "A♠.svg" becomes "A♠"
    const base = filename.replace("./", "").replace(".svg", "");

    // BACK CARD (1B.svg)
    if (base === BACK) {
        cardSvgs[BACK] = module.default;
        return;
    }

    // Validate: must be Rank + SuitLetter
    if (base.length !== 2) return;

    const rank = base[0];       // "A"
    const suitLetter = base[1]; // "S"

    const suitSymbol = SUIT_MAP[suitLetter];
    if (!suitSymbol) return;

    // Build symbolic code: "A♠"
    const code = `${rank}${suitSymbol}` as CardCode;

    if (CARD_CODES.includes(code)) {
        cardSvgs[code] = module.default;
    }
});

// ---------------------------------------------------------------------------
// CARD SIZES (UI)
// ---------------------------------------------------------------------------

export const CARD_SIZE = {
    SMALL: { width: 40, height: 60 },
    MEDIUM: { width: 70, height: 100 },
    LARGE: { width: 100, height: 150 },
};

// ---------------------------------------------------------------------------
// DECK HELPERS
// ---------------------------------------------------------------------------

// Standard Fisher-Yates shuffle
export const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Generate a fresh shuffled 52-card deck (no BACK)
export const generateDeck = (): CardCode[] => shuffle([...RANKED_CODES]);
