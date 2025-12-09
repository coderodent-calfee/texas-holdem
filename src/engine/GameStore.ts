import type { EngineState, EnginePlayer, EnginePublicState } from "../engine/TexasHoldemEngine";
import type { CardCode } from "../engine/cards";
import { AllowedActions, BettingEngineState, PlayerAction, SpecialAction } from "./BettingEngine";

export interface GameStore {
  getCurrentPlayer(): EnginePlayer | null;
  getAllowedActions(id : string): AllowedActions;
  applyPlayerAction( action: PlayerAction, amount?: number):boolean;
  applyPlayerSpecialAction(id:string, action: SpecialAction): boolean ;
  getBettingState(): BettingEngineState;
  // Accessors
  getEngineState(): EngineState;
  getPublicState(): EnginePublicState;
  getPlayers(): EnginePlayer[];
  getHoleCards(playerId: string): [CardCode, CardCode] | null;
  // Game progression
  step(): boolean;
  advanceDealer(): void;
  
  // Hand resets
  resetHand(): void;
  resetHandWithDeck(deck: CardCode[]): void;

  // Player management
  setPlayers(players: EnginePlayer[]): void;
  increasePlayerCount(): void;
  decreasePlayerCount(): void;
}
