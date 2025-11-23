// src/screens/SpectatorTable.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import PlayerDisplay from "../components/PlayerDisplay";
import Card from "../components/Card";
import { BACK } from "../engine/cards";
import { GameStore } from "../engine/GameStore";
import {
  EngineState,
  EnginePlayer,
  EnginePublicState,
  TexasHoldemEngine
} from "../engine/TexasHoldemEngine";
import Chip from "../components/Chip";
import ChipSVG from "../components/ChipSVG";
import VerticalProgressBar from "../components/Thermometer";

interface SpectatorTableProps {
  store: GameStore;
  onSelectPlayer: (id: string) => void;
}

const SpectatorTable: React.FC<SpectatorTableProps> = ({ store, onSelectPlayer }) => {
  const { state,
    players,
    communityCards,
    dealerId,
    pot,
    minBet,
    toCall,
  } = store.getPublicState();

  if (!players || players.length < 2) return null;

  const seatingMap: {
    top: EnginePlayer[];
    bottom: EnginePlayer[];
    right: EnginePlayer[];
    left: EnginePlayer[];
  } = {
    top: [],
    bottom: [],
    right: [],
    left: []
  };

  if (players.length === 2) {
    seatingMap["bottom"].push(players[0]);
    seatingMap["top"].push(players[1]);
  }
  else if (players.length === 3) {
    seatingMap["bottom"].push(players[0]);
    seatingMap["top"].push(players[1]);
    seatingMap["top"].push(players[2]);
  }
  else {
    type seatKey = keyof typeof seatingMap;
    const seatingCount: Record<seatKey, number> = Object.fromEntries(
      Object.keys(seatingMap).map(key => [key, 0])
    ) as Record<seatKey, number>;

    const addOrder = Object.keys(seatingMap);
    const seatOrder: seatKey[] = ["bottom", "left", "top", "right"];

    let index = 0;
    players.forEach((_, index) => {
      const seat: seatKey = addOrder[index % addOrder.length] as seatKey;
      seatingCount[seat] += 1;
    });

    let currentRow = 0;
    index = 0;
    players.forEach((player) => {
      const row: seatKey = seatOrder[currentRow] as seatKey;
      seatingMap[row].push(player);
      if (seatingMap[row].length >= seatingCount[row]) {
        currentRow += 1;
      }
      index += 1;
    });
  }

  // Reverse the order for clockwise display from dealer left
  seatingMap.bottom = seatingMap.bottom.reverse();
  seatingMap.left = seatingMap.left.reverse();
  console.log("communityCards =", communityCards);
  return (
    <View style={styles.container}>


      <View style={styles.oval} />


      <View
        style={styles.content}
      >
        {/* --- Left column: left players top-to-bottom --- */}
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {seatingMap.left.map((p) => (
            <PlayerDisplay
              key={p.id}
              player={p}
              onPress={() => onSelectPlayer(p.id)}
            />
          ))}
        </View>

        {/* --- Middle column: top row, center (pot + community), bottom row --- */}
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
              gap: 2,
            }}
          >
            {seatingMap.top.map((p) => (
              <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
                <PlayerDisplay
                  player={p}
                  onPress={() => onSelectPlayer(p.id)}
                />
              </View>
            ))}
          </View>

          {/* Center: pot & community cards */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
              paddingHorizontal: 10,
            }}
          >

            <View style={{
              alignItems: "center",
              minHeight: 154,
            }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Pot: {pot}</Text>
              <Text>Live Bet: {toCall}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                {communityCards.map((c) => (
                  <Card key={c} code={c} width={70} height={100} />
                ))}
                <ChipSVG size={200}
                  stacks={[
                    { chipCount: 1, color: "#005637" }, // green $25 #0FA15B #4A6330 "#017945" #005637
                    { chipCount: 15, color: "#016EB1" }, // blue $10 #283371 #016EB1
                    { chipCount: 25, color: "#812c05ff" }, // red : $5
                    { chipCount: 5, color: "#cacacaff", rim: "#000000" }, // white $1
                  ]}
                ></ChipSVG>
              </View>
            </View>
            {/* <VerticalProgressBar
                value={200}
                maxValue={500}
                barColor="#00ade9" // A nice blue color
                containerHeight={200} // Total height of the thermometer
                containerWidth={30} // Width of the thermometer
              /> */}
          </View>
          {/* Bottom row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
              paddingHorizontal: 10,
            }}
          >
            {seatingMap.bottom.map((p) => (
              <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
                <PlayerDisplay
                  player={p}
                  onPress={() => onSelectPlayer(p.id)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* --- Right column: right players top-to-bottom --- */}
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {seatingMap.right.map((p, i) => (
            <PlayerDisplay
              key={p.id}
              player={p}
              onPress={() => onSelectPlayer(p.id)}
            />
          ))}
        </View>
      </View>
    </View>

  );
};

export default SpectatorTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#267032",
    padding: 20,
    flexDirection: "row", // outermost row
    justifyContent: "space-between",
    alignItems: "stretch",
  },

  oval: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "80%",
    height: "60%",
    borderWidth: 6,
    borderColor: "#D8E0D8",
    borderRadius: 9999,
    zIndex: -1,          // works *only* inside same parent
  },

  content: {
    flexDirection: "row", // outermost row
    justifyContent: "space-between",
    alignItems: "stretch", flex: 1,
    zIndex: 1,
  },

  chipContainer: {
    flexDirection: 'row',       // stacks horizontally
    alignItems: 'flex-end',     // bottom-align all stacks
    justifyContent: 'center',   // center horizontally
    paddingHorizontal: 10,
    // remove fixed height: container grows automatically with tallest stack
  },


});

/*

41 pixels high for 120 chips  at size 20

 aspect 0.45 chipHeight 9 count 120 stackSpacing 3 totalStackHeight 366

 individual chip height should be 0.341

one chip at 200 is 50 pixels

*/