// src/screens/SpectatorTableWrapper.tsx
import React, { useState, useMemo } from "react";
import { View, Button, Text } from "react-native";
import SpectatorTable from "./SpectatorTable";
import { LocalGameStore } from "../engine/LocalGameStore";

import EngineStateTester from "../components/EngineStateTester";
import { BACK } from "../engine/cards";
import PlayerTable from "./PlayerTable";

interface Props {
  onSelectPlayer: (id: string) => void;
}

export default function SpectatorTableWrapper({ onSelectPlayer }: Props) {
  // --- Stable local store ---
  const store = useMemo(() => new LocalGameStore(), []);
  const [endOfRound, setEndOfRound] = useState(false);

  // --- Debug UI state ---
  const [mode, setMode] = useState<"spectator" | "player">("spectator");
  const [playerIndex, setPlayerIndex] = useState(0);

  // --- Re-render trigger ---
  const [, forceRender] = useState(0);
  const refresh = () => forceRender(x => x + 1);

  // --- Player selection logic ---
  const players = store.getPlayers();
  const currentPlayer = players[playerIndex];
  const currentPlayerId = currentPlayer?.id ?? null;

  // --- Dealer / next player (testing) ---
  const nextDealer = () => {
    store.advanceDealer();
    forceRender(x => x + 1);
  };

  const nextPlayer = () => {
    setPlayerIndex((playerIndex + 1) % players.length);
    setMode("player");
    refresh();
  };

  const handleNextPlayer = () => {
    store.getEngineState() === "Blinds & Ante" ? nextDealer() : nextPlayer();
  };

  const handleSelectPlayer = (id: string) => {
    console.log(">>> Player button pressed:", id);
    const index = players.findIndex(p => p.id === id);

    if (index !== -1) {
      setPlayerIndex(index);
      setMode("player");
      refresh(); // force re-render so PlayerTable updates immediately
    }
  };

  const isSpectator = () => {
    return mode === "spectator";
  }

  const handleSpectator = () => {
    console.log(">>> Spectator Mode button pressed");
    setMode("spectator");
  }

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
        <Button title={store.getEngineState() === "Blinds & Ante" ? "Next Dealer" : "Next Player"}
          onPress={handleNextPlayer} />
                <Text style={{ alignSelf: "center", marginHorizontal: 10 }}>
          {`${mode} ${isSpectator()?"":currentPlayer.name}`}
        </Text>
        <EngineStateTester
          engineState={store.getEngineState()}
          onAdvanceEngine={() => { advanceEngine() }}
        />
      </View>
      {/* Debug: switch to spectator */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Button
          title="Spectator Mode"
          onPress={handleSpectator}
        />
      </View>
      {/* Spectator Table */}
      <View style={{ flex: 1 }}>

{mode === "spectator"? <SpectatorTable store={store} onSelectPlayer={handleSelectPlayer} /> :
        <PlayerTable store={store} onSelectPlayer={handleSelectPlayer} playerId={currentPlayer.id} />

}


      </View>

    </View>
  );
}
