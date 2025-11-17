// src/screens/SpectatorTableWrapper.tsx
import React, { useState, useMemo } from "react";
import { View, Button, Text } from "react-native";
import SpectatorTable from "./SpectatorTable";
import { LocalGameStore } from "../engine/LocalGameStore";
import { fakeGame } from "../data/fakeGame"; // the fake Game you created
import EngineStateTester from "../components/EngineStateTester";
import { HoldemEngine } from "../engine/HoldemEngine";

interface Props {
  onSelectPlayer: (id: string) => void;
}

export default function SpectatorTableWrapper({ onSelectPlayer }: Props) {
  // --- Stable local store ---
  const store = useMemo(() => new LocalGameStore(fakeGame), []);
  // --- Holdem engine for controlling phases ---
  const engine = useMemo(() => new HoldemEngine(store), [store]);
  const [, forceRender] = useState(0);


  // Full internal gameplay state
  const fullState = store.getState();
  const fullPlayers = store.getPlayers();

  // --- Visible player count ---
  const [playerCount, setPlayerCount] = useState(7);
  const clamp = (v: number) => Math.min(Math.max(v, 2), 10);

  const visiblePlayers = fullPlayers.slice(0, playerCount);

  // --- Debug Gameplay Controls ---
  const [dealerIndex, setDealerIndex] = useState(0);

  const nextPlayer = () => {
    setDealerIndex((dealerIndex + 1) % visiblePlayers.length);
  };

  // --- Build modified view of table state ---
  const uiPlayers = visiblePlayers.map((p, idx) => ({
    ...p,
    isDealer: idx === dealerIndex,
  }));

  const uiCommunityCards = fullState.communityCards;

  return (
    <View style={{ flex: 1 }}>
      {/* Player Count Controls */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10, gap: 10 }}>
        <Button title="−" onPress={() => setPlayerCount(clamp(playerCount - 1))} />
        <Text style={{ alignSelf: "center", marginHorizontal: 10 }}>{playerCount} players</Text>
        <Button title="+" onPress={() => setPlayerCount(clamp(playerCount + 1))} />
      </View>

      {/* Debug Controls */}
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 10 }}>
        <Button title="Next Player" onPress={nextPlayer} />
        <EngineStateTester
          onAdvanceEngine={(nextState) => {
            console.log("next state");
            switch (nextState) {
              case "preflop":
                engine.dealHoleCards();
                break;
              case "flop":
                engine.revealFlop();
                break;
              case "turn":
                engine.revealTurn();
                break;
              case "river":
                engine.revealRiver();
                break;
              case "showdown":
                store.shuffleDeck(); // optional: reset hand
                break;
            }
            forceRender(x => x + 1);

          }}
        />


      </View>

      {/* Actual Spectator Table */}
      <SpectatorTable
        tableState={{
          ...fullState,
          players: uiPlayers,
          communityCards: uiCommunityCards,
        }}
        onSelectPlayer={onSelectPlayer}
      />
    </View>
  );
}
