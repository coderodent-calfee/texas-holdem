// src/screens/SpectatorTableWrapper.tsx
import React, { useState, useMemo } from "react";
import { View, Button, Text } from "react-native";
import SpectatorTable from "./SpectatorTable";
import { LocalGameStore } from "../engine/LocalGameStore";

import EngineStateTester from "../components/EngineStateTester";
import { BACK } from "../engine/cards";

interface Props {
  onSelectPlayer: (id: string) => void;
}

export default function SpectatorTableWrapper({ onSelectPlayer }: Props) {
  // --- Stable local store ---
  const store = useMemo(() => new LocalGameStore(), []);
  const [endOfRound, setEndOfRound] = useState(false);

  // --- Force re-render for UI updates ---
  const [, forceRender] = useState(0);

  // --- Dealer / next player (testing) ---
  const [dealerIndex, setDealerIndex] = useState(0);
  const nextPlayer = () => {
    setDealerIndex((dealerIndex + 1) % store.getPlayers().length);
  };
  const snapshot = store.getPublicState();
  const currentState = store.getEngineState();
  const advanceEngine = () => {
    if (endOfRound) {
      store.resetHand();
      setEndOfRound(false);
    } else {
      const canContinue = store.step();
      if (!canContinue) {
        setEndOfRound(true);
      }
    } forceRender(x => x + 1);
  };

  const increasePlayerCount = () => {
    store.increasePlayerCount();
    forceRender(x => x + 1);
  };


  const decreasePlayerCount = () => {
    store.decreasePlayerCount();
    forceRender(x => x + 1);
  };

  // --- Table snapshot from store ---
  const tableState = store.getPublicState();

  return (
    <View style={{ flex: 1 }}>
      {/* Player Count Controls */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 10,
          gap: 10,
        }}
      >
        <Button title="−" onPress={() => decreasePlayerCount()} />
        <Text style={{ alignSelf: "center", marginHorizontal: 10 }}>
          {store.getPlayers().length} players
        </Text>
        <Button title="+" onPress={() => increasePlayerCount()} />
      </View>

      {/* Engine State Tester */}
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 10 }}>
        <Button title="Next Player" onPress={nextPlayer} />
        <EngineStateTester
          engineState={store.getEngineState()}
          onAdvanceEngine={() => { advanceEngine() }}
        />
      </View>

      {/* Spectator Table */}
      <SpectatorTable
        store={store}
        onSelectPlayer={onSelectPlayer}
      />
    </View>
  );
}
