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
import ChipSVG from "../components/ChipSVG";
import ProgressBar from "../components/ProgressBar";
import { ONE_DOLLAR_CHIP,FIVE_DOLLAR_CHIP, TEN_DOLLAR_CHIP, TWENTY_FIVE_DOLLAR_CHIP, convertAmountToChipStacks } from "../components/Chip";
import { seatPlayers } from "../engine/seating";
import TableLayout from "../components/TableLayout"
import { FlashProvider } from "../components/FlashContext";
import AnnouncementBurst from "../components/AnnouncementBurst";
import AnnouncementOverlay from "../components/AnnouncementOverlay";



interface SpectatorTableProps {
  store: GameStore;
  onSelectPlayer: (id: string) => void;
}

const SpectatorTable: React.FC<SpectatorTableProps> = ({ store, onSelectPlayer }) => {
  const { state,
    players,
    communityCards,
    dealerId,
  } = store.getPublicState();

  if (!players || players.length < 2) return null;

  const seatingMap = seatPlayers(players);
  const betting = store.getBettingState();
  
  return (
    
    <TableLayout
      top={ seatingMap.top.map((p) => (
        <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
          <PlayerDisplay player={p} onPress={() => onSelectPlayer(p.id)} /> 
        </View>))}

      bottom={ seatingMap.bottom.map((p) => (
        <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
          <PlayerDisplay player={p} onPress={() => onSelectPlayer(p.id)} /> 
        </View>))}
      
      left={seatingMap.left.map((p) => (
        <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
      ))}
      
      right={seatingMap.right.map((p) => (
        <PlayerDisplay key={p.id} player={p} onPress={() => onSelectPlayer(p.id)} />
      ))}
      
      center={
        <View style={{ alignItems: "center", minHeight: 154, }}>
          <ChipSVG 
            size={100}
            stacks={convertAmountToChipStacks(betting.pot)} />
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Spectator Table Pot: {betting.pot}</Text>
          <Text>Live Bet: {betting.toCall}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {communityCards.map((c) => (
              <Card key={c} code={c} width={70} height={100} />
            ))}
          </View>
  <AnnouncementOverlay
  messages={[
    state
  ]}
  color="cyan"
  maxScale={10}
  scaleDurationMs={3000}
/>

        </View>          
      }
    />

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

    // <View style={styles.container}>


    //   <View style={styles.oval} />


    //   <View
    //     style={styles.content}
    //   >
    //     {/* --- Left column: left players top-to-bottom --- */}
    //     <View
    //       style={{
    //         flexDirection: "column",
    //         justifyContent: "center",
    //       }}
    //     >
    //       {seatingMap.left.map((p) => (
    //         <PlayerDisplay
    //           key={p.id}
    //           player={p}
    //           onPress={() => onSelectPlayer(p.id)}
    //         />
    //       ))}
    //     </View>

    //     {/* --- Middle column: top row, center (pot + community), bottom row --- */}
    //     <View
    //       style={{
    //         flex: 1,
    //         flexDirection: "column",
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //       }}
    //     >
    //       {/* Top row */}
          // <View
          //   style={{
          //     flexDirection: "row",
          //     justifyContent: "center",
          //     width: "100%",
          //     gap: 2,
          //   }}
          // >
            // {seatingMap.top.map((p) => (
            //   <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
            //     <PlayerDisplay
            //       player={p}
            //       onPress={() => onSelectPlayer(p.id)}
            //     />
            //   </View>
            // ))}
          // </View>

    //       {/* Center: pot & community cards */}
    //       <View
    //         style={{
    //           flexDirection: "row",
    //           justifyContent: "center",
    //           width: "100%",
    //           paddingHorizontal: 10,
    //         }}
    //       >

    //         <View style={{
    //           alignItems: "center",
    //           minHeight: 154,
    //         }}>
    //           <Text style={{ fontSize: 20, fontWeight: "bold" }}>Spectator Table Pot: {betting.pot}</Text>
    //           <Text>Live Bet: {betting.toCall}</Text>
    //           <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
    //             {communityCards.map((c) => (
    //               <Card key={c} code={c} width={70} height={100} />
    //             ))}
    //             <ChipSVG size={150}
    //               stacks={[
    //                 { chipCount: 1, ...TWENTY_FIVE_DOLLAR_CHIP }, 
    //                 { chipCount: 15, ...TEN_DOLLAR_CHIP }, // blue $10 #283371 #016EB1
    //                 { chipCount: 25, ...FIVE_DOLLAR_CHIP }, // red : $5
    //                 { chipCount: 5, ...ONE_DOLLAR_CHIP }, // white $1
    //               ]}
    //             ></ChipSVG>
    //           </View>
    //         </View>

    //       </View>
    //       {/* Bottom row */}
    //       <View
    //         style={{
    //           flexDirection: "row",
    //           justifyContent: "center",
    //           width: "100%",
    //           paddingHorizontal: 10,
    //         }}
    //       >
    //         {seatingMap.bottom.map((p) => (
    //           <View key={p.id} style={{ flex: 1, alignItems: "center" }}>
    //             <PlayerDisplay
    //               player={p}
    //               onPress={() => onSelectPlayer(p.id)}
    //             />
    //           </View>
    //         ))}
    //       </View>
    //     </View>

    //     {/* --- Right column: right players top-to-bottom --- */}
    //     <View
    //       style={{
    //         flexDirection: "column",
    //         justifyContent: "center",
    //         gap: 10,
    //       }}
    //     >
    //       {seatingMap.right.map((p, i) => (
    //         <PlayerDisplay
    //           key={p.id}
    //           player={p}
    //           onPress={() => onSelectPlayer(p.id)}
    //         />
    //       ))}
    //     </View>
    //   </View>
    // </View>
