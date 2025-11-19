import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import Card from "./Card";
import Logo from "./Logo";
import { BACK, CARD_SIZE, CardCode } from "../engine/cards";
import {
  EngineState,
  EnginePlayer,
  EnginePublicState,
  TexasHoldemEngine
} from "../engine/TexasHoldemEngine";


const PlayerDisplay = ({
  player,
  onPress,
}: {
  player: EnginePlayer;
  onPress?: () => void;
}) => {
  const grey = player.folded;

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
        {(player?.holeCards && player.holeCards.map( (code : CardCode, idx) => 
          (<Card key={idx} code={code} {...CARD_SIZE.SMALL} />)
        ))}
      </View>


    </Pressable>
  );
};

export default PlayerDisplay;


      // <View style={{ flexDirection: "row", marginTop: 4, gap: 4 }}>
      //   {player.isDealer && (
      //     <Text style={{ backgroundColor: "gold", padding: 2 }}>D</Text>
      //   )}
      //   {player.isSmallBlind && (
      //     <Text style={{ backgroundColor: "lightblue", padding: 2 }}>SB</Text>
      //   )}
      //   {player.isBigBlind && (
      //     <Text style={{ backgroundColor: "lightgreen", padding: 2 }}>BB</Text>
      //   )}
      // </View>