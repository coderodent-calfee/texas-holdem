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
    return this.engine.getPublicState();
  }
  getPlayers(): EnginePlayer[] {
    return this.getPublicState().players;
  }
  // ---------------------------------------------------
  // Advance the game by one engine action
  // (for local testing this might simulate dealing,
  // progressing betting rounds, etc.)
  // ---------------------------------------------------
  step() {
    this.engine.step();
    this.publicState = this.getPublicState();
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
      e.holeCards = p.holeCards;
  });

    if(current.length < this.playerCount){
      for (let i = current.length; i< this.playerCount; i++){
        // new players only play at the start of the round
        enginePlayers[i].folded = true;
      }
    }

    this.engine.setPlayers(enginePlayers.slice(0, this.playerCount));

    this.publicState = this.engine.getPublicState();
  }
}



//   // ---------------------------------------------------------
//   // Game Controls
//   // ---------------------------------------------------------
//   step() {
//     this.engine.step();
//     this.publicState = this.engine.getPublicState();
//   }

//   resetHand() {
//     this.engine.resetHand();
//     this.publicState = this.engine.getPublicState();
//   }

//   resetHandWithDeck(deck: string[]) {
//     this.engine.resetHandWithDeck(deck);
//     this.publicState = this.engine.getPublicState();
//   }

//   // ---------------------------------------------------------
//   // Accessors for UI / wrapper
//   // ---------------------------------------------------------
//   getEngineState(): EngineState {
//     return this.engine.state;
//   }

//   getPublicState(): EnginePublicState {
//     return this.publicState;
//   }

//   getPlayers(): EnginePlayer[] {
//     return this.enginePlayers;
//   }

//   getPlayerCount(): number {
//     return this.playerCount;
//   }
// }
