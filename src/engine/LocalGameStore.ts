// src/logic/LocalGameStore.ts
import type { Game } from "../types/Game";
import type { Player as GlobalPlayer } from "../types/Player";
import { generateDeck, shuffle } from "./deck";
import type { GameStore } from "./GameStore";
import type { TexasHoldem } from "../types/table";
import { BACK, CardCode } from "../utils/loadCards";
import { createInitialTableState } from "./state";
import { useState } from "react";

export class LocalGameStore implements GameStore {
  private game: Game;                         // full global game (stable)
  private deck: CardCode[];                     // stable deck across re-renders
  private holdemPlayers: TexasHoldem.Player[]; // canonical gameplay players
  private tableState: TexasHoldem.TableState;  // mutable gameplay state

  constructor(game: Game) {
    this.game = game;

    // Convert global → Hold'em-specific players
    this.holdemPlayers = this.createHoldemPlayers(game.players);

    // Initial table state contains gameplay fields like chips, holeCards, etc.
    this.tableState = createInitialTableState(this.holdemPlayers);

    // Stable shuffled deck
    this.deck = shuffle(generateDeck());
  }

  /** Convert global player → Holdem player */
  private createHoldemPlayers(players: GlobalPlayer[]): TexasHoldem.Player[] {
    return players.map((p) => ({
      base: p,
      chips: 500,
      active: true,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      holeCards: [BACK, BACK],
    }));
  }

  // ---- PUBLIC API ----

  getGame() {
    return this.game;
  }

  getPlayers(): TexasHoldem.Player[] {
    return this.holdemPlayers;
  }

  getState(): TexasHoldem.TableState {
    return this.tableState;
  }

  updateState(updater: (s: TexasHoldem.TableState) => void) {
    updater(this.tableState);
  }

  getDeck() {
    return this.deck;
  }

  shuffleDeck() {
    this.deck = shuffle(generateDeck());
  }
}
