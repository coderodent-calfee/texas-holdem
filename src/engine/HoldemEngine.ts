// src/logic/HoldemEngine.ts
import type { GameStore } from "./GameStore";
import type { TexasHoldem } from "../types/table";
import { CardCode } from "src/utils/loadCards";

export class HoldemEngine {
  constructor(private store: GameStore) {}

  /** Deal hole cards to each Hold'em player */
  dealHoleCards() {
    const deck = this.store.getDeck();
    const players = this.store.getPlayers();

    this.store.updateState((state) => {
      players.forEach((p, i) => {
        p.holeCards = [deck[i * 2] as CardCode, deck[i * 2 + 1]as CardCode];
      });
    });
  }

  /** Reveal the flop (burn 1, reveal 3) */
  revealFlop() {
    const deck = this.store.getDeck();
    this.store.updateState((state) => {
      state.communityCards = deck.slice(2 * this.store.getPlayers().length + 1,   // after hole cards + burn
                                        2 * this.store.getPlayers().length + 4);  // 3 flop cards
    });
  }

  /** Reveal the turn (burn 1, reveal 1) */
  revealTurn() {
    const deck = this.store.getDeck();
    const offset = 2 * this.store.getPlayers().length + 4; // after flop
    this.store.updateState((state) => {state.communityCards.push(deck[offset + 1]);} );
//    this.store.updateState((state) => {state.communityCards.push(deck[offset + 1]); return;});
  }

  /** Reveal the river (burn 1, reveal 1) */
  revealRiver() {
    const deck = this.store.getDeck();
    const offset = 2 * this.store.getPlayers().length + 6; // after turn
    this.store.updateState((state) => {
      state.communityCards.push(deck[offset + 1]);
    });
  }
}
