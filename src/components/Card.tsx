import React from 'react';
import { cards } from '../utils/loadCards';


const suitMap: Record<string, string> = {
  "♠": "S",
  "♥": "H",
  "♦": "D",
  "♣": "C",
};

function normalize(code: string): string {
  if (code === "1B") return "1B"; // back card
  const rank = code[0];
  const suit = code[1];
  return rank + suitMap[suit];
}

interface CardProps {
  code: string;
  width?: number | string;
  height?: number | string;
}

const Card: React.FC<CardProps> = ({ code, width = 80, height = 120 }) => {
    const key = normalize(code);
  const CardComponent = cards[key];
  if (!CardComponent) return null;

  return <CardComponent width={width} height={height} />;
};

export default Card;
