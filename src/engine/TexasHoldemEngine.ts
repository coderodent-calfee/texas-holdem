// src/engine/TexasHoldemEngine.ts
import { CardCode, generateDeck, shuffle, BACK } from "../engine/cards"; // adjust path if your cards file is elsewhere


export const ENGINE_STATES = [
   "Blinds & Ante",
   "Pre-Flop Bet",
   "flop",
   "turn",
   "river",
   "showdown",
   "reveal"
] as const;



export type EngineState = (typeof ENGINE_STATES)[number];

export interface EnginePlayer {
  id: string;
  name: string;
  seat: number;
  chips: number;
  committed: number;
  folded: boolean;
  holeCards: [CardCode, CardCode] | null;
}

export interface EnginePublicState {
  state: EngineState;
  players: EnginePlayer[];
  communityCards: CardCode[];
  dealer: number;
  pot: number;
  minBet: number;
  toCall: number;
}

export class TexasHoldemEngine {
  // ---------------------------------------------------------------------------
  // INTERNAL AUTHORITATIVE STATE
  // ---------------------------------------------------------------------------

  private players: EnginePlayer[] = [];
  private communityCards: CardCode[] = [];
  private deck: CardCode[] = [];
  private state: EngineState = "Blinds & Ante";

  private dealerIndex = 0;
  private pot = 0;

  private minBet = 0;
  private toCall = 0;

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  /** Called by the store to push the current list of players */
  setPlayers(players: EnginePlayer[]) {
console.log("setting this.players ", this.players);
    
    this.players = [...players];
console.log("to this.players ", this.players);
  }

  /** Begin a new hand with a random deck */
  resetHand() {
    this.deck = shuffle(generateDeck());
    this.resetInternalState();
  }

  /** Begin a new hand with a forced deck (tester mode) */
  resetHandWithDeck(deck: CardCode[]) {
    this.deck = [...deck];
    this.resetInternalState();
  }

  /**
   * Advance engine one deterministic step.
   * Returns true if further stepping is possible; false when reached terminal state.
   */
  step(): boolean {
    switch (this.state) {
      case "Blinds & Ante":
        return this.doDeal();

      case "Pre-Flop Bet":
        return this.doPreflop();

      case "flop":
        return this.doFlop();

      case "turn":
        return this.doTurn();

      case "river":
        return this.doRiver();

      case "showdown":
        return this.doShowdown();

      case "reveal":
        return false;
    }

    // should never get here, but return false defensively
    return false;
  }

  /** UI and store use this to render */
  getPublicState(): EnginePublicState {
    return {
      state: this.state,
      players: this.players,
      communityCards: this.communityCards,
      dealer: this.dealerIndex,
      pot: this.pot,
      minBet: this.minBet,
      toCall: this.toCall,
    };
  }

  // ---------------------------------------------------------------------------
  // STATE MACHINE IMPLEMENTATION
  // ---------------------------------------------------------------------------

  private resetInternalState() {
    this.communityCards = [];
    this.pot = 0;
    this.minBet = 0;
    this.toCall = 0;
console.log("this.players ", this.players);
  if (!Array.isArray(this.players)) {
    console.warn("players is not an array, resetting to empty array", this.players);
    this.players = [];
  }
    for (const p of this.players) {
      p.committed = 0;
      p.folded = false;
      p.holeCards = null;
    }

    this.state = "Blinds & Ante";
  }

  private doDeal(): boolean {
    if (this.players.length === 0) return false;

    // deal 2 cards to each player in seat order stored in players[]
    let index = 0;
    for (const p of this.players) {
      p.holeCards = [this.deck[index]!, this.deck[index + 1]!];
      index += 2;
    }

    this.state = "Pre-Flop Bet";
    return true;
  }

  private doPreflop(): boolean {
    // burn one, then 3 community cards
    const offset = this.players.length * 2 + 1; // after hole cards + burn
    this.communityCards = [
      this.deck[offset]!,
      this.deck[offset + 1]!,
      this.deck[offset + 2]!,
    ];
    this.state = "flop";
    return true;
  }

  private doFlop(): boolean {
    const offset = this.players.length * 2 + 4; // after flop + burn
    this.communityCards.push(this.deck[offset]!);

    this.state = "turn";
    return true;
  }

  private doTurn(): boolean {
    const offset = this.players.length * 2 + 5; // after turn + burn
    this.communityCards.push(this.deck[offset]!);

    this.state = "river";
    return true;
  }

  private doRiver(): boolean {

    this.state = "showdown";
    return true;
  }

  private doShowdown(): boolean {
    // showdown resolution placeholder; move to reveal
    this.state = "reveal";
    return false;
  }


}
