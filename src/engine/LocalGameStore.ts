// LocalGameStore.ts

import {
  EngineState,
  EnginePlayer,
  EnginePublicState,
  TexasHoldemEngine
} from "../engine/TexasHoldemEngine";
import { CardCode, generateDeck, shuffle, BACK } from "../engine/cards"; // adjust path if your cards file is elsewhere


// ---------------------------------------------
// Fake data for local testing
// ---------------------------------------------
import { fakeGame } from "../data/fakeGame";
import { fakePlayers } from "../data/fakePlayers";
import type { Player } from "../types/Player";
import { AllowedActions, BettingEngine, BettingEngineState, noActions, PlayerAction } from "./BettingEngine";

const enginePlayers: EnginePlayer[] =
  fakePlayers.map((p, index) => {
    const player: EnginePlayer = {
      id: p.playerId,
      name: p.name,
      seat: index,
      chips: 500,
      committed: 0,
      folded: false,
      holeCards: null
    };
    return player;
  });

// ---------------------------------------------
// LocalGameStore
// ---------------------------------------------
export class LocalGameStore {
  private gameEngine: TexasHoldemEngine;
  private bettingEngine: BettingEngine;
  private publicState: EnginePublicState;
  // Number of players active (2–10)
  private playerCount: number = 7;
  private currentPlayerIndex: number | null = 0;

  constructor() {
    this.gameEngine = new TexasHoldemEngine();
    this.bettingEngine = new BettingEngine();
    this.initializeFromFake();
    // Capture initial public state
    this.publicState = this.getPublicState();
    this.startBettingRound();
  }

  // ---------------------------------------------------
  // Setup with fake data
  // ---------------------------------------------------
  private initializeFromFake() {
    // Install fake players
    this.gameEngine.setPlayers(enginePlayers.slice(0, this.playerCount));

    // Reset the first hand
    this.gameEngine.resetHand();

    // Capture initial public state
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Accessors
  // ---------------------------------------------------
  getCurrentPlayer(): EnginePlayer | null {
    const engineState = this.gameEngine.getPublicState();
    const players = engineState.players;
    return this.currentPlayerIndex != null ? players[this.currentPlayerIndex] : null;
  }

  getEngineState(): EngineState {
    return this.getPublicState().state;
  }

  getBettingState(): BettingEngineState {
    return this.bettingEngine.getState();
  }

  getAllowedActions(id: string): AllowedActions {
    const engineState = this.getPublicState();
    const players = engineState.players;
    const state = engineState.state;
    if (state === "Blinds & Ante") {
      const player = players.find(p => p.id === id);
      const actedThisRound = this.getBettingState().actedThisRound;
      if (player && !actedThisRound.has(player.id)) {
        return {
          ...noActions,
          canPaySmallBlind: player.isSmallBlind,
          canPayBigBlind: player.isBigBlind,
        };
      }
      return noActions;

    }
    if (state === "reveal") {
      return noActions;
    }
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return noActions;
    }
    if (id !== currentPlayer.id) {
      return noActions;
    }
    return this.bettingEngine.getAllowedActions(currentPlayer);
  }

  applyPlayerAction(action: PlayerAction, amount?: number): boolean {
    const ok = this.bettingEngine.applyPlayerAction(this.getCurrentPlayer(), action, amount);
    if (ok) {
      if (this.bettingEngine.isRoundComplete(this.getPlayers())) {
        this.step();
        this.startBettingRound();
      }
      else {
        const engineState = this.gameEngine.getPublicState();
        this.currentPlayerIndex = this.getNextActivePlayerIndex(engineState.players, this.currentPlayerIndex!);
      }
    }
    return ok;
  }
  applyPlayerSpecialAction(id:string, action: PlayerAction): boolean {
    const ok = this.bettingEngine.applyPlayerSpecialAction(this.getCurrentPlayer(), action);
    if (ok) {
      if (this.bettingEngine.isRoundComplete(this.getPlayers())) {
        this.step();
        this.startBettingRound();
      }
      else {
        const engineState = this.gameEngine.getPublicState();
        this.currentPlayerIndex = this.getNextActivePlayerIndex(engineState.players, this.currentPlayerIndex!);
      }
    }
    return ok;
  }
  getPublicState(): EnginePublicState {
    const engineState = this.gameEngine.getPublicState();

    const players = engineState.players;
    const dealerIndex = players.findIndex(p => p.id === engineState.dealerId);

    // Compute small and big blind indices, wrapping around
    const smallBlindIndex = dealerIndex >= 0 ? (dealerIndex + 1) % players.length : -1;
    const bigBlindIndex = dealerIndex >= 0 ? (dealerIndex + 2) % players.length : -1;

    const beforeDeal = engineState.state === "Blinds & Ante";

    if (engineState.state !== "reveal") {
      const publicPlayers: EnginePlayer[] = players.map((p, i) => ({
        ...p,
        holeCards: (beforeDeal || p.folded) ? null : [BACK, BACK],
        isDealer: beforeDeal && p.id === engineState.dealerId,
        isSmallBlind: beforeDeal && i === smallBlindIndex,
        isBigBlind: beforeDeal && i === bigBlindIndex,

      }));
      return {
        ...engineState,
        players: publicPlayers
      }
    } else {
      const publicPlayers: EnginePlayer[] = players.map(p => ({
        ...p,
        holeCards: (p.folded) ? null : p.holeCards,
      }));
      return {
        ...engineState,
        players: publicPlayers
      }
    }
  }

  getHoleCards(playerId: string): [CardCode, CardCode] | null {
    const engineState = this.gameEngine.getPublicState();
    const player = engineState.players.find(p => p.id === playerId);
    if (!player) return null;
    return player.holeCards;
  }

  getPlayers(): EnginePlayer[] {
    return this.getPublicState().players;
  }

  /**
  * Returns the next active player index, skipping folded players.
  * @param players EnginePlayer array
  * @param startIndex Index to start searching from (exclusive)
  */
  getNextActivePlayerIndex(players: EnginePlayer[], startIndex: number): number | null {
    const total = players.length;
    if (total === 0) return null;

    let idx = (startIndex + 1) % total;

    while (idx !== startIndex) {
      const player = players[idx];
      if (!player.folded) return idx;
      idx = (idx + 1) % total;
    }

    // check if the startIndex player is active (edge case: only one active player)
    if (!players[startIndex].folded) return startIndex;

    return null; // all players folded
  }

  // ---------------------------------------------------
  // Advance the game by one engine action
  // (for local testing this might simulate dealing,
  // progressing betting rounds, etc.)
  // ---------------------------------------------------
  step(): boolean {
    const canContinue = this.gameEngine.step();
    this.publicState = this.getPublicState();
    return canContinue;
  }

  isRoundComplete(players: EnginePlayer[]): boolean {
    return this.bettingEngine.isRoundComplete(players);
  }

  advanceDealer(): void {
    this.gameEngine.nextDealer();
  }

  startBettingRound() {
    const engineState = this.gameEngine.getPublicState();
    const dealerIndex = engineState.players.findIndex(p => p.id === engineState.dealerId);
    const smallIndex = this.getNextActivePlayerIndex(engineState.players, dealerIndex);
    const bigIndex = smallIndex && this.getNextActivePlayerIndex(engineState.players, smallIndex);
    this.currentPlayerIndex = bigIndex && this.getNextActivePlayerIndex(engineState.players, bigIndex);
    this.bettingEngine.beginNewBettingRound(engineState.players);
  }
  // ---------------------------------------------------
  // Start a brand new hand with a fresh deck
  // ---------------------------------------------------
  resetHandWithDeck(deck: CardCode[]) {
    this.gameEngine.resetHandWithDeck(deck);
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Start a brand new hand but keep the current deck
  // ---------------------------------------------------
  resetHand() {
    this.gameEngine.resetHand();
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // For future UI controls:
  // change number of players
  // ---------------------------------------------------
  setPlayers(players: EnginePlayer[]) {
    this.gameEngine.setPlayers(players);
    this.gameEngine.resetHand();
    this.publicState = this.getPublicState();
  }

  increasePlayerCount() {
    if (this.playerCount >= 10) return;

    this.playerCount++;

    this.applyPlayerCountChange();
  }

  decreasePlayerCount() {
    if (this.playerCount <= 2) return;

    this.playerCount--;

    this.applyPlayerCountChange();
  }

  // ---------------------------------------------------------
  // Player count controls (2–10)
  // ---------------------------------------------------------

  private applyPlayerCountChange() {
    const current = this.getPlayers();
    current.map((p, index) => {
      const e = enginePlayers[index];
      e.chips = p.chips;
      e.seat = p.seat;
      e.committed = p.committed;
      e.folded = p.folded;
      //e.holeCards = p.holeCards;
    });

    if (current.length < this.playerCount) {
      for (let i = current.length; i < this.playerCount; i++) {
        // new players only play at the start of the round
        enginePlayers[i].folded = this.getEngineState() !== "Blinds & Ante";
      }
    }

    this.gameEngine.setPlayers(enginePlayers.slice(0, this.playerCount));

    this.publicState = this.gameEngine.getPublicState();
  }
}


