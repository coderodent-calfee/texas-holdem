// src/screens/PlayerTable.tsx
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
//import Chip from "../components/Chip";
import ChipSVG from "../components/ChipSVG";
import ProgressBar from "../components/ProgressBar";
import { BetAmountSelector } from "../components/BetAmountSelector";
import { noActions, PlayerAction } from "../engine/BettingEngine";
import { convertAmountToChipStacks } from "../components/Chip";

interface PlayerTableProps {
  store: GameStore;
  onSelectPlayer: (id: string) => void;
  displayedPlayerId: string;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ store, onSelectPlayer, displayedPlayerId }) => {
  const [bettingMode, setBettingMode] = useState<PlayerAction | null>(null);
  const currentPlayerId = store.getCurrentPlayer()?.id;

  const { state,
    players: playersArg,
    communityCards,
    dealerId,
  } = store.getPublicState();

  const originalIndex = playersArg.findIndex(p => p.id === displayedPlayerId);
  const players = playersArg.slice(originalIndex).concat(playersArg.slice(0, originalIndex));

  if (!players || players.length < 2) return null;
  const player = players.find(p => p.id === displayedPlayerId);
  if (!player) {
    return <Text>Player not found</Text>;
  }
  const isSelf = player.id === displayedPlayerId;
  
  if (isSelf) {
    const holeCards = store.getHoleCards(displayedPlayerId);
    if (holeCards) {
      player.holeCards = holeCards;
    }
  }
  const canAct = (id: string): boolean => {
    return isSelf && store.getCurrentPlayer()?.id === id;
  };


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

  const allowedMoves = canAct(player.id) ? store.getAllowedActions() : noActions;

  const betting = store.getBettingState();
  if (canAct(player.id)) { console.log(`Player:${player.name} allowed moves:`, allowedMoves, ' bet ', betting); }

  const handlePlayerAction = (action: PlayerAction) => {
    console.log(`handlePlayerAction: ${action}`);

    // Bet or raise opens BetAmountSelector
    if (action === "bet" || action === "raise") {
      setBettingMode(action);
    } else {
      // Non-bet actions return a promise for consistency
      Promise.resolve()
        .then(() => store.applyPlayerAction(action))
        .then(() => {
          console.log(`Action '${action}' applied successfully`);
        })
        .catch((err) => {
          console.log(`Action '${action}' failed:`, err);
        });
    }
  };


  const handleBetConfirm = (amount: number, action: string) => {
    console.log(`handleBetConfirm: ${action} ${amount}`);

    Promise.resolve()
      .then(() => {
        if (bettingMode) {
          const ok = store.applyPlayerAction(bettingMode, amount);
          if (!ok) { throw new Error("Invalid bet amount"); }
        }
      })
      .then(() => {
        setBettingMode(null); // close selector after success
      })
      .catch((err) => {
        console.log("Bet failed or canceled:", err);
        setBettingMode(null); // optionally reset on error/cancel
      });
  };

  const handleBetCancel = () => {
    setBettingMode(null);
  };



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
            justifyContent: "space-between",
            gap: 20,

          }}
        >
          {seatingMap.left.map((player) => {
            const isActive = player.id === store.getCurrentPlayer()?.id;

            // Only compute allowedMoves for the active player AND only if it's self
            const allowedMoves =
              isSelf && isActive ? store.getAllowedActions() : noActions;

            return (
              <PlayerDisplay
                key={player.id}
                player={player}
                currentPlayerId={store.getCurrentPlayer()?.id}
                displayedPlayerId={displayedPlayerId}
                allowedMoves={allowedMoves}
                handlePlayerAction={handlePlayerAction}
                onPress={() => onSelectPlayer(player.id)}
              />
            );
          })}

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
            {seatingMap.top.map((player) => {
              const isActive = player.id === store.getCurrentPlayer()?.id;

              // Only compute allowedMoves for the active player AND only if it's self
              const allowedMoves =
                isSelf && isActive ? store.getAllowedActions() : noActions;

              return (
                <PlayerDisplay
                  key={player.id}
                  player={player}
                  currentPlayerId={store.getCurrentPlayer()?.id}
                  displayedPlayerId={displayedPlayerId}
                  allowedMoves={allowedMoves}
                  handlePlayerAction={handlePlayerAction}
                  onPress={() => onSelectPlayer(player.id)}
                />
              );
            })}

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

            {(bettingMode === "bet" || bettingMode === "raise") && (
              <View>
                <BetAmountSelector
                  allowed={allowedMoves}
                  mode={bettingMode}            // "bet" or "raise"
                  stack={player.chips}
                  onConfirm={handleBetConfirm}
                  onCancel={handleBetCancel}
                />
              </View>
            )}
            {(bettingMode !== "bet" && bettingMode !== "raise") && (
              <View style={{
                alignItems: "center",
                minHeight: 154,
              }}>
                <ChipSVG size={100}
                  stacks={convertAmountToChipStacks(betting.pot)}
                ></ChipSVG>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Player Table Pot: {betting.pot}</Text>
                <Text>Live Bet: {betting.toCall}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  {communityCards.map((c) => (
                    <Card key={c} code={c} width={70} height={100} />
                  ))}
                </View>
              </View>
            )}

          </View>
          {/* Bottom row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 20,

              width: "100%",
              paddingHorizontal: 10,
            }}
          >
            {seatingMap.bottom.map((player) => {
              const isActive = player.id === store.getCurrentPlayer()?.id;

              // Only compute allowedMoves for the active player AND only if it's self
              const allowedMoves =
                isSelf && isActive ? store.getAllowedActions() : noActions;

              return (
                <PlayerDisplay
                  key={player.id}
                  player={player}
                  currentPlayerId={store.getCurrentPlayer()?.id}
                  displayedPlayerId={displayedPlayerId}
                  allowedMoves={allowedMoves}
                  handlePlayerAction={handlePlayerAction}
                  onPress={() => onSelectPlayer(player.id)}
                />
              );
            })}

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
          {seatingMap.right.map((player) => {
            const isActive = player.id === store.getCurrentPlayer()?.id;

            // Only compute allowedMoves for the active player AND only if it's self
            const allowedMoves =
              isSelf && isActive ? store.getAllowedActions() : noActions;

            return (
              <PlayerDisplay
                key={player.id}
                player={player}
                currentPlayerId={store.getCurrentPlayer()?.id}
                displayedPlayerId={displayedPlayerId}
                allowedMoves={allowedMoves}
                handlePlayerAction={handlePlayerAction}
                onPress={() => onSelectPlayer(player.id)}
              />
            );
          })}

        </View>
      </View>
    </View>

  );
};

export default PlayerTable;

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

