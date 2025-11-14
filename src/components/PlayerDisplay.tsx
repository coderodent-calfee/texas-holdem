import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import Card from "./Card";
import Logo from "./Logo";
import type { Player, TableState } from "../types/table";
import { BACK, CARD_SIZE } from "../utils/loadCards";

const PlayerDisplay = ({
  player,
  onPress,
}: {
  player: Player;
  onPress?: () => void;
}) => {
  const grey = !player.active;

  return (
    <Pressable
      style={{
        alignItems: "center",
        padding: 6,
        opacity: grey ? 0.4 : 1,
        cursor: "pointer",
      }}
      onPress={onPress}
    >
      <Logo size={50} />

      <Text style={{ fontWeight: "bold" }}>{player.name}</Text>
      <Text>{player.chips} chips</Text>

      <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
        {(player.holeCards.length
          ? player.holeCards
          : [BACK, BACK] // default to two face-down cards
        ).map((code, idx) => (
          <Card key={idx} code={code} {...CARD_SIZE.SMALL} />
        ))}
      </View>

      <View style={{ flexDirection: "row", marginTop: 4, gap: 4 }}>
        {player.isDealer && (
          <Text style={{ backgroundColor: "gold", padding: 2 }}>D</Text>
        )}
        {player.isSmallBlind && (
          <Text style={{ backgroundColor: "lightblue", padding: 2 }}>SB</Text>
        )}
        {player.isBigBlind && (
          <Text style={{ backgroundColor: "lightgreen", padding: 2 }}>BB</Text>
        )}
      </View>
    </Pressable>
  );
};

export default PlayerDisplay;
