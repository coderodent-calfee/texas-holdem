import React from "react";
import Card from "./Card";
import FlashingWrapper from "./FlashingWrapper";

interface FlashingCardProps {
  code: string; // unique id for the card
  width?: number | string;
  height?: number | string;
}

const FlashingCard: React.FC<FlashingCardProps> = ({ code, width, height }) => {
  return (
    <FlashingWrapper id={code}>
      <Card code={code} width={width} height={height} />
    </FlashingWrapper>
  );
};

export default FlashingCard;
