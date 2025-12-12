import React from "react";
import { View, Text, Image, Pressable, Button } from "react-native";
import Card from "./Card";
import Logo from "./Logo";
import { BACK, CARD_SIZE, CardCode } from "../engine/cards";
import {
  EnginePlayer,
} from "../engine/TexasHoldemEngine";
import ChipSVG from "./ChipSVG";
import DealerChip from "./DealerChip";
import { AllowedActions, PlayerAction } from "../engine/BettingEngine";
import { convertAmountToChipStacks } from "../components/Chip";

// ✅ Added strongly typed props for clarity
interface PlayerDisplayProps {
  player: EnginePlayer;
  currentPlayerId?: string;
  onPress?: () => void;
  displayedPlayerId?: string;
  allowedMoves?: AllowedActions;
  handlePlayerAction?: (action: PlayerAction) => void;
}

const PlayerDisplayComponent = ({
  player,
  currentPlayerId,
  onPress,
  displayedPlayerId,
  allowedMoves,
  handlePlayerAction,
}: PlayerDisplayProps) => {

  const grey = player.folded;
  const isSelf = player.id === displayedPlayerId;
  const isActive = currentPlayerId === player.id;

  return (
    <Pressable
      style={{
        alignItems: "center",
        opacity: grey ? 0.4 : 1,
        cursor: "pointer",
        backgroundColor: "#a0949377",
        borderRadius: 12,
        paddingLeft: 10,
        paddingVertical: 4,
        paddingRight: 6,
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>

        <View style={{ flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Logo size={isSelf ? 100 : 50} />
          <ChipSVG size={isSelf ? 50 : 50} stacks={convertAmountToChipStacks(player.chips)} />
        </View>

        <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontWeight: "bold" }}>{player.name}</Text>
          <Text>{player.chips} chips</Text>

          {player.isDealer && <DealerChip />}
          {player.isBigBlind && <DealerChip color={"#EDDE02"} text="BIG\nBLIND" />}
          {player.isSmallBlind && <DealerChip color={"#016EB1"} text="SMALL\nBLIND" />}

          <View style={{ flexDirection: "row", gap: 4, marginTop: 4, paddingLeft: 4 }}>
            {player?.holeCards &&
              player.holeCards.map((code: CardCode, idx) => (
                <Card
                  key={idx}
                  code={code}
                  {...(isSelf ? CARD_SIZE.MEDIUM : CARD_SIZE.SMALL)}
                />
              ))}
          </View>
        </View>

        <View style={{ flexDirection: "column", alignItems: "center", gap: 2 }}>
          {isSelf &&
            allowedMoves && (
              <>

                {allowedMoves.canClaimWinnings && (
                  <Button
                    title="Collect"
                    onPress={() => handlePlayerAction?.("claim-winnings")}
                  />
                )}
              </>
            )}
          {isActive && isSelf &&
            allowedMoves && (
              <>
                {Object.entries(allowedMoves).map(([key, value]) => {
                  if (
                    key === "canPaySmallBlind" ||
                    key === "canPayBigBlind" ||
                    key === "canClaimWinnings"
                  ) {
                    return null;
                  }
                  if (typeof value !== "boolean" || !value) return null;

                  const label = key.replace(/^can/, "").replace(/^./, (c) => c.toUpperCase());

                  return (
                    <Button
                      key={key}
                      title={label}
                      onPress={() =>
                        handlePlayerAction?.(label.toLowerCase() as PlayerAction)
                      }
                    />
                  );
                })}
              </>
            )}
        </View>
      </View>
    </Pressable>
  );
};

// ----------------------------------------------------
// ✅ Key change — wrap in React.memo
// ----------------------------------------------------
const PlayerDisplay = React.memo(
  PlayerDisplayComponent,

  // 👇 Custom comparison function so React only re-renders when needed
  (prev, next) => {
    return (
      prev.player === next.player && // deep changes handled by engine immutability
      prev.currentPlayerId === next.currentPlayerId &&
      prev.allowedMoves === next.allowedMoves &&
      prev.displayedPlayerId === next.displayedPlayerId
    );
  }
);

export default PlayerDisplay;
