import React from 'react';
import { cards } from '../utils/loadCards';

interface CardProps {
  code: string; // e.g., "AS", "TD", etc.
  width?: number | string;
  height?: number | string;
}

const Card: React.FC<CardProps> = ({ code, width = 80, height = 120 }) => {
  const CardComponent = cards[code];
  if (!CardComponent) return null;

  return <CardComponent width={width} height={height} />;
};

export default Card;
