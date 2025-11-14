// src/screens/SpectatorTable.tsx
import React from "react";
import { View, Text } from "react-native";
import PlayerDisplay from "../components/PlayerDisplay";
import Card from "../components/Card";
import type { Player, TableState } from "../types/table";

interface SpectatorTableProps {
  tableState: TableState;
  onSelectPlayer: (id: string) => void;
}

const SpectatorTable: React.FC<SpectatorTableProps> = ({ tableState, onSelectPlayer }) => {
  const { players, pot, liveBet, communityCards } = tableState;

  if (!players || players.length === 0) return null;

  // Reverse the order for clockwise display from dealer left
  const orderedPlayers = [...players].reverse();

  // Determine layout: top, middle, bottom
  const topRow = orderedPlayers.slice(0, Math.floor(orderedPlayers.length / 3));
  const middleRow = orderedPlayers.slice(Math.floor(orderedPlayers.length / 3), Math.ceil((orderedPlayers.length * 2) / 3));
  const bottomRow = orderedPlayers.slice(Math.ceil((orderedPlayers.length * 2) / 3));

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "green",
        padding: 20,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Top row */}
      <View style={{ flexDirection: "row", justifyContent: "center", width: "100%" }}>
        {topRow.map((p) => (
          <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
        ))}
      </View>

      {/* Middle row: left/right players with pot & community cards in center */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {middleRow[0] && <PlayerDisplay player={middleRow[0]} onPress={() => onSelectPlayer(middleRow[0].id)} />}

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Pot: {pot}</Text>
          <Text>Live Bet: {liveBet}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {communityCards.map((c) => (
              <Card key={c} code={c} width={70} height={100} />
            ))}
          </View>
        </View>

        {middleRow[1] && <PlayerDisplay player={middleRow[1]} onPress={() => onSelectPlayer(middleRow[1].id)} />}
      </View>

      {/* Bottom row */}
      <View style={{ flexDirection: "row", justifyContent: "center", width: "100%" }}>
        {bottomRow.map((p) => (
          <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
        ))}
      </View>
    </View>
  );
};

export default SpectatorTable;
