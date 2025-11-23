// src/engine/TexasHoldemEngine.ts
import { CardCode, generateDeck, shuffle, BACK } from "../engine/cards"; // adjust path if your cards file is elsewhere
import { scoreHand, HandScore, determineWinners } from "./handScorer"; // your scoring module


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
  isDealer?: boolean;
  isBigBlind?: boolean;
  isSmallBlind?: boolean;
}

export interface EnginePublicState {
  state: EngineState;
  players: EnginePlayer[];
  communityCards: CardCode[];
  dealerId: string;
  pot: number;
  minBet: number;
  toCall: number;
  scores?: Record<string, HandScore>;
  winners?: string[];
}

export class TexasHoldemEngine {
  // ---------------------------------------------------------------------------
  // INTERNAL AUTHORITATIVE STATE
  // ---------------------------------------------------------------------------

  private players: EnginePlayer[] = [];
  private communityCards: CardCode[] = [];
  private deck: CardCode[] = [];
  private state: EngineState = "Blinds & Ante";

  private dealerId = "";
  private pot = 0;

  private minBet = 0;
  private toCall = 0;
  private scores: Record<string, HandScore> = {};
  private winners: string[] = [];

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

  public nextDealer(): void {
    const players = this.players;
    const count = players.length;

    if (count === 0) return;

    // Find current dealer index (or start before 0 if unset)
    const currentIndex = players.findIndex(p => p.id === this.dealerId);
    const startIndex = currentIndex >= 0 ? currentIndex : -1;

    let nextIndex = startIndex;

    // Rotate forward looking for a player with chips > 0
    for (let i = 1; i <= count; i++) {
      const candidate = (startIndex + i) % count;
      if (players[candidate].chips > 0) {
        nextIndex = candidate;
        break;
      }
    }

    // If we found no eligible player, do nothing
    if (nextIndex === startIndex) return;

    // Assign new dealerId
    this.dealerId = players[nextIndex].id;
  }

  /** UI and store use this to render */
  getPublicState(): EnginePublicState {
    return {
      state: this.state,
      players: this.players,
      communityCards: this.communityCards,
      dealerId: this.dealerId,
      pot: this.pot,
      minBet: this.minBet,
      toCall: this.toCall,
      scores: this.state === "reveal" ? this.scores : undefined,
      winners: this.state === "reveal" ? this.winners : undefined,
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
    if (this.players.length > 0) {
      this.dealerId = this.players[0].id;
    }
    this.state = "Blinds & Ante";
    this.scores = {};
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
    // Only score active players who didn’t fold
    this.scores = {};
    for (const p of this.players) {
      if (!p.folded && p.holeCards) {
        this.scores[p.id] = scoreHand(p.holeCards, this.communityCards);
      }
      console.log(`Player:${p.name} has a ${this.scores[p.id].type} with ${this.scores[p.id].ranks}`);
    }
    this.winners = determineWinners(this.scores);
    this.winners.forEach((id) => {
      const winner = this.players.find(p => p.id === id);
      if (winner) {
        console.log(`Player:${winner.name} wins with a ${this.scores[winner.id].type} with ${this.scores[winner.id].ranks}`);
      }

    });

    this.state = "reveal";
    return false;
  }


}
