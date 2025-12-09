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
import { noActions, PlayerAction, SPECIAL_ACTIONS, SpecialAction } from "../engine/BettingEngine";
import { convertAmountToChipStacks } from "../components/Chip";
import { seatPlayers } from "../engine/seating";
import TableLayout from "../components/TableLayout";

interface PlayerTableProps {
  store: GameStore;
  onSelectPlayer: (id: string) => void;
  displayedPlayerId: string;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ store, onSelectPlayer, displayedPlayerId }) => {
  const [bettingMode, setBettingMode] = useState<PlayerAction | null>(null);
  const [currentPlayerId, setcurrentPlayerId] = useState(store.getCurrentPlayer()?.id);
  // --- Re-render trigger ---
  const [, forceRender] = useState(0);
  const refresh = () => forceRender(x => x + 1);

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
  // const canAct = (id: string): boolean => {
  //   return isSelf && store.getCurrentPlayer()?.id === id;
  // };


  const seatingMap = seatPlayers(players);

  const allowedMoves = store.getAllowedActions(player.id);

  const betting = store.getBettingState();

  console.log(`Player:${player.name} allowed moves:`, allowedMoves);
  console.log(`Player:${player.name} betting state: `, betting);

  const handlePlayerAction = (action: PlayerAction) => {
    if (SPECIAL_ACTIONS.includes(action as SpecialAction)) {
      Promise.resolve()
        .then(() => {
          const blind = players.find(p =>
            (p.isBigBlind && (action === 'pay-big-blind')) ||
            (p.isSmallBlind && (action === 'pay-small-blind')));
          if (!blind) 
          {
            throw new Error("no player to ${action}");
          }
          console.log(`Action '${action}' for ${blind?.name} `);
          store.applyPlayerSpecialAction(blind.id, action as SpecialAction);
        })
        .then(() => {
          console.log(`Action '${action}' applied successfully; need to check if both blinds paid and move to next step`);
          refresh();
        })
        .catch((err) => {
          console.log(`Action '${action}' failed:`, err);
        });
      return;
    }
    console.log(`Action '${action}' for ${store.getCurrentPlayer()?.name} `);
    // Bet or raise opens BetAmountSelector
    if (action === "bet" || action === "raise") {
      setBettingMode(action);
    } else {
      // Non-bet actions return a promise for consistency
      Promise.resolve()
        .then(() => store.applyPlayerAction(action))
        .then(() => {
          console.log(`Action '${action}' applied successfully: turn passes to ${store.getCurrentPlayer()?.name} `);
          setcurrentPlayerId(store.getCurrentPlayer()?.id);
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
        console.log(`Action '${action}' applied successfully: turn passes to ${store.getCurrentPlayer()?.name} `);
        setcurrentPlayerId(store.getCurrentPlayer()?.id);
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
    <TableLayout
      top={seatingMap.top.map((p) => (
        <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
          <PlayerDisplay player={p} onPress={() => onSelectPlayer(p.id)} />
        </View>))}

      bottom={seatingMap.bottom.map((p) => {
        const allowedMoves =

          !bettingMode &&  // I pressed bet or raise already, and the betting amount thing is open
            isSelf // drawing a not 'me' window
            ?
            store.getAllowedActions(p.id) : noActions;
        return (
          <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
            <PlayerDisplay
              player={p}
              currentPlayerId={store.getCurrentPlayer()?.id}
              displayedPlayerId={displayedPlayerId}
              allowedMoves={allowedMoves}
              handlePlayerAction={handlePlayerAction}
              onPress={() => onSelectPlayer(p.id)}
            />
          </View>
        );
      })}

      left={seatingMap.left.map((p) => (
        <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
      ))}

      right={seatingMap.right.map((p) => (
        <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
      ))}

      center={
        (bettingMode === "bet" || bettingMode === "raise") ?
          (
            <View>
              <BetAmountSelector
                allowed={allowedMoves}
                mode={bettingMode}
                stack={player.chips}
                onConfirm={handleBetConfirm}
                onCancel={handleBetCancel}
              />
            </View>
          ) :
          (
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
          )
      }
    />
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

