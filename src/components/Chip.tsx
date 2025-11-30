
export const ONE_DOLLAR_CHIP = { color: "#cacacaff", rim: "#000000" }; // white $1
export const FIVE_DOLLAR_CHIP = { color: "#812c05ff" }; // red $5
export const TEN_DOLLAR_CHIP = { color: "#016EB1" }; // blue $10:  other colors -- #283371 #016EB1
export const TWENTY_FIVE_DOLLAR_CHIP = { color: "#005637" }; // green $25  other colors --  #0FA15B #4A6330 "#017945" #005637
export const ONE_HUNDRED_DOLLAR_CHIP = { color: "#222222" , rim: "#cacacaff" }; // black $100

export interface ChipStack {
  chipCount: number;
  color: string;
  rim?: string;
}

export function convertAmountToChipStacks(amount: number) : ChipStack[] {
  let remaining = amount;

  const count100 = Math.floor(remaining / 100);
  remaining -= count100 * 100;

  const count25 = Math.floor(remaining / 25);
  remaining -= count25 * 25;

  const count10 = Math.floor(remaining / 10);
  remaining -= count10 * 10;

  const count5 = Math.floor(remaining / 5);
  remaining -= count5 * 5;

  const count1 = remaining; // remainder is $1 chips

  const result: { chipCount: number; color: string; rim?: string }[] = [];

  if (count100 > 0) {
    result.push({
      chipCount: count100,
      ...ONE_HUNDRED_DOLLAR_CHIP,
    });
  }

  if (count25 > 0) {
    result.push({
      chipCount: count25,
      ...TWENTY_FIVE_DOLLAR_CHIP,
    });
  }

  if (count10 > 0) {
    result.push({
      chipCount: count10,
      ...TEN_DOLLAR_CHIP,
    });
  }

  if (count5 > 0) {
    result.push({
      chipCount: count5,
      ...FIVE_DOLLAR_CHIP,
    });
  }

  if (count1 > 0) {
    result.push({
      chipCount: count1,
      ...ONE_DOLLAR_CHIP,
    });
  }

  return result;
}


const NAMED_COLORS: Record<string, string> = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blue: "#0000FF",
    brown: "#A52A2A",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkgreen: "#006400",
    darkred: "#8B0000",
    gold: "#FFD700",
    gray: "#808080",
    green: "#008000",
    indigo: "#4B0082",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lime: "#00FF00",
    magenta: "#FF00FF",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#FFA500",
    orchid: "#DA70D6",
    pink: "#FFC0CB",
    purple: "#800080",
    red: "#FF0000",
    salmon: "#FA8072",
    silver: "#C0C0C0",
    tan: "#D2B48C",
    teal: "#008080",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    white: "#FFFFFF",
    yellow: "#FFFF00"
};

export function normalizeColor(color: string): string | null {
    if (!color) return null;

    // Already hex
    if (color.startsWith("#")) return color;

    // Convert named colors
    const hex = NAMED_COLORS[color.toLowerCase()];
    return hex ?? null;
}