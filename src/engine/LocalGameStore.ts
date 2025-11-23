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
  private engine: TexasHoldemEngine;
  private publicState: EnginePublicState;
  // Number of players active (2–10)
  private playerCount: number = 7;

  constructor() {
    this.engine = new TexasHoldemEngine();
    this.initializeFromFake();
    // Capture initial public state
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Setup with fake data
  // ---------------------------------------------------
  private initializeFromFake() {
    // Install fake players
    this.engine.setPlayers(enginePlayers.slice(0, this.playerCount));

    // Reset the first hand
    this.engine.resetHand();

    // Capture initial public state
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Accessors
  // ---------------------------------------------------
  getEngineState(): EngineState {
    return this.getPublicState().state;
  }

  getPublicState(): EnginePublicState {
    const engineState = this.engine.getPublicState();

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


  getPlayers(): EnginePlayer[] {
    return this.getPublicState().players;
  }
  // ---------------------------------------------------
  // Advance the game by one engine action
  // (for local testing this might simulate dealing,
  // progressing betting rounds, etc.)
  // ---------------------------------------------------
  step(): boolean {
    const canContinue = this.engine.step();
    this.publicState = this.getPublicState();
    return canContinue;
  }


  advanceDealer(): void {
    this.engine.nextDealer();
  }
  // ---------------------------------------------------
  // Start a brand new hand with a fresh deck
  // ---------------------------------------------------
  resetHandWithDeck(deck: CardCode[]) {
    this.engine.resetHandWithDeck(deck);
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Start a brand new hand but keep the current deck
  // ---------------------------------------------------
  resetHand() {
    this.engine.resetHand();
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // For future UI controls:
  // change number of players
  // ---------------------------------------------------
  setPlayers(players: EnginePlayer[]) {
    this.engine.setPlayers(players);
    this.engine.resetHand();
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

    this.engine.setPlayers(enginePlayers.slice(0, this.playerCount));

    this.publicState = this.engine.getPublicState();
  }
}


