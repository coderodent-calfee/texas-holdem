import type { EngineState, EnginePlayer, EnginePublicState } from "../engine/TexasHoldemEngine";
import type { CardCode } from "../engine/cards";

export interface GameStore {
  // Accessors
  getEngineState(): EngineState;
  getPublicState(): EnginePublicState;
  getPlayers(): EnginePlayer[];

  // Game progression
  step(): boolean;

  // Hand resets
  resetHand(): void;
  resetHandWithDeck(deck: CardCode[]): void;

  // Player management
  setPlayers(players: EnginePlayer[]): void;
  increasePlayerCount(): void;
  decreasePlayerCount(): void;
}
