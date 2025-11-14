const req = require.context(
  "../../assets/svg/cards", // adjust relative path
  false,
  /\.svg$/
);

export type CardCode =
  | "A♠" | "A♥" | "A♦" | "A♣"
  | "K♠" | "K♥" | "K♦" | "K♣"
  | "Q♠" | "Q♥" | "Q♦" | "Q♣"
  | "J♠" | "J♥" | "J♦" | "J♣"
  | "T♠" | "T♥" | "T♦" | "T♣"
  | "9♠" | "9♥" | "9♦" | "9♣"
  | "8♠" | "8♥" | "8♦" | "8♣"
  | "7♠" | "7♥" | "7♦" | "7♣"
  | "6♠" | "6♥" | "6♦" | "6♣"
  | "5♠" | "5♥" | "5♦" | "5♣"
  | "4♠" | "4♥" | "4♦" | "4♣"
  | "3♠" | "3♥" | "3♦" | "3♣"
  | "2♠" | "2♥" | "2♦" | "2♣"
  | "1♠" | "1♥" | "1♦" | "1♣"
  | "1B";

export const BACK: CardCode = "1B";

export const cards: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {};

req.keys().forEach((filename) => {
  const module = req(filename) as { default: React.FC<React.SVGProps<SVGSVGElement>> };

  const base = filename.replace("./", "").replace(".svg", "");

  cards[base] = module.default;
});

export const CARD_SIZE = {
  SMALL: { width: 40, height: 60 },
  MEDIUM: { width: 70, height: 100 },
  LARGE: { width: 100, height: 150 },
};
