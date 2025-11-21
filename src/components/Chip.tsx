import React from "react";
import { View, StyleSheet } from "react-native";
import ChipSVG from "../../assets/svg/icons/10_chip-for-casino-games_8312608.svg";
import Svg, { G } from "react-native-svg";

type ChipProps = {
  width?: number;
  height?: number;
  // optional transform props
};

const Chip: React.FC<ChipProps> = ({
  width = 40,
  height = 40,
}) => {
  const original = 1407.8845; // from your SVG viewBox
  const scaleX = width / original;
  const scaleY = height / original;

  return (
        <ChipSVG width={width} height={height}/>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chip;
