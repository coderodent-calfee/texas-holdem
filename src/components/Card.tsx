import React from 'react';
import { CardCode, cardSvgs } from '../engine/cards';
import FlashingWrapper from '../components/FlashingWrapper';

interface CardProps {
  code: CardCode;
  width?: number | string;
  height?: number | string;
}

const Card: React.FC<CardProps> = ({ code, width = 80, height = 120 }) => {
  const CardComponent = cardSvgs[code];
  if (!CardComponent) return null;

  return (
    <FlashingWrapper id={code}>
      <CardComponent width={width} height={height} />
    </FlashingWrapper>
  );
};

export default Card;
