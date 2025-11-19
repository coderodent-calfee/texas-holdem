import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { LocalGameStore } from "../engine/LocalGameStore";
import { EngineState, CardCode } from "../engine/cards";
import { PlayerDisplay } from "../components/PlayerDisplay";
import { Card } from "../components/Card";

// store instance
const store = new LocalGameStore();

export const SpectatorTableWrapper: React.FC = () => {
  const [, forceUpdate] = useState(0); // trigger re-render

  // --- Player count controls ---
  const addPlayer = () => {
    if (store.getPlayers().length >= 10) return;
    store.addPlayer();
    forceUpdate((v) => v + 1);
  };

  const removePlayer = () => {
    if (store.getPlayers().length <= 2) return;
    store.removePlayer();
    forceUpdate((v) => v + 1);
  };

  // --- Engine controls ---
  const advanceEngine = () => {
    store.advanceEngine();
    forceUpdate((v) => v + 1);
  };

  // --- Table data ---
  const table = store.getSnapshotForTable();
  const state = store.getCurrentEngineState();
  const nextState = store.getNextEngineState();

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Player count controls */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>
        <Button title="Add Player" onPress={addPlayer} />
        <Text style={{ marginHorizontal: 20 }}>Players: {store.getPlayers().length}</Text>
        <Button title="Remove Player" onPress={removePlayer} />
      </View>

      {/* Engine advance button */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text>Current State: {state}</Text>
        <Text>Next State: {nextState}</Text>
        <Button title="Advance Engine" onPress={advanceEngine} />
      </View>

      {/* Table rendering */}
      <View style={{ flex: 1, backgroundColor: "green", padding: 10 }}>
        {/* Top row */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {table.top.map((p) => (
            <PlayerDisplay key={p.id} player={p} />
          ))}
        </View>

        {/* Center row: left, community, right */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
          <View>
            {table.left.map((p) => (
              <PlayerDisplay key={p.id} player={p} />
            ))}
          </View>

          <View style={{ alignItems: "center" }}>
            <Text>Pot: {table.pot}</Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              {table.communityCards.map((c: CardCode, i: number) => (
                <Card key={i} code={c} width={70} height={100} />
              ))}
            </View>
          </View>

          <View>
            {table.right.map((p) => (
              <PlayerDisplay key={p.id} player={p} />
            ))}
          </View>
        </View>

        {/* Bottom row */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
          {table.bottom.map((p) => (
            <PlayerDisplay key={p.id} player={p} />
          ))}
        </View>
      </View>
    </View>
  );
};
