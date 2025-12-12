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
import { AllowedActions, BettingEngine, BettingEngineState, noActions, PlayerAction, SpecialAction } from "./BettingEngine";

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
  private listeners: (() => void)[] = [];
  private revealCountdown: number | undefined = undefined;
  private countdownTimer: any = null;

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitChange() {
    console.log("Emitting change to listeners:", this.listeners.length);
    for (const l of this.listeners) l();
  }

  constructor() {
    this.gameEngine = new TexasHoldemEngine();
    this.bettingEngine = new BettingEngine();
    this.initializeFromFake();
    // Capture initial public state
    this.publicState = this.getPublicState();
     this.initPreflopBlinds();
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
    const engineState = this.gameEngine.getEngineState(); // the engine's public state has actual players
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
    const actedThisRound = this.getBettingState().actedThisRound;

    if (state === "reveal") {
      if (!engineState.winners?.includes(id)) {
        return noActions;
      }
      return {
        ...noActions,
        canClaimWinnings: engineState.winners?.includes(id) && !actedThisRound.has(id),
      };
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
        const engineState = this.gameEngine.getEngineState();
        this.currentPlayerIndex = this.getNextActivePlayerIndex(engineState.players, this.currentPlayerIndex!);
      }
    }
    return ok;
  }


  claimWinnings(playerId: string): boolean {
    const engineState = this.gameEngine.getEngineState();
    const acted = this.bettingEngine.getState().actedThisRound;

    if (engineState.state !== "reveal") return false;
    if (!engineState.winners?.includes(playerId)) return false;
    if (acted.has(playerId)) return false;

    const player = this.gameEngine.getEngineState().players.find(p => p.id === playerId);
    if (!player) return false;

    // Determine how many winners have not claimed yet
    const unclaimedWinners = engineState.winners.filter(w => !acted.has(w));

    // Split the pot evenly among unclaimed winners
    const potAmount = this.bettingEngine.getState().pot;
    const share = Math.floor(potAmount / unclaimedWinners.length);

    // Add share to this player
    this.bettingEngine.distributePot(player, share);

    acted.add(playerId);

    this.emitChange();
    return true;
  }

  autoClaimRemainingWinners() {
    const engineState = this.gameEngine.getEngineState();
    const acted = this.bettingEngine.getState().actedThisRound;

    engineState.winners?.forEach(w => {
      if (!acted.has(w)) {
        this.claimWinnings(w);
      }
    });
  }

  // the store's public state has -copies- of the players with added info
  getPublicState(): EnginePublicState {
    const engineState = this.gameEngine.getEngineState();

    const players = engineState.players;
    const dealerIndex = players.findIndex(p => p.id === engineState.dealerId);

    //TODO: In two-player (heads-up) Texas Hold'em, the player with the dealer button posts the Small Blind (SB), and the other player posts the Big Blind (BB)
    const smallBlindIndex = dealerIndex >= 0 ? (dealerIndex + 1) % players.length : -1;
    const bigBlindIndex = dealerIndex >= 0 ? (dealerIndex + 2) % players.length : -1;

    const beforeDeal = engineState.state === "Pre-Flop Bet";
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
        revealCountdown: this.revealCountdown,
        players: publicPlayers
      }
    }
  }

  getHoleCards(playerId: string): [CardCode, CardCode] | null {
    const engineState = this.gameEngine.getEngineState();
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

  startRevealCountdown() {

    if (this.revealCountdown) return; // already running

    this.revealCountdown = 30; // seconds
    console.log("revealCountdown started");

    this.countdownTimer = setInterval(() => {
      if (this.revealCountdown! > 0) {
        this.revealCountdown!--;
        console.log(`revealCountdown: ${this.revealCountdown}`);

        this.emitChange();
      }

      if (this.revealCountdown === 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.finishRevealStage();
      }

    }, 1000);
  }

  finishRevealStage() {
    this.revealCountdown = undefined;
    this.autoClaimRemainingWinners();
    this.resetHand();
    this.advanceDealer();
    this.initPreflopBlinds();
    this.emitChange();
  }

  // ---------------------------------------------------
  // Advance the game by one engine action
  // (for local testing this might simulate dealing,
  // progressing betting rounds, etc.)
  // ---------------------------------------------------
  step(): boolean {
    const canContinue = this.gameEngine.step();
    this.publicState = this.getPublicState();

    if (this.publicState.state === "reveal") {
      console.log("startRevealCountdown");
      this.startRevealCountdown();
    }

    this.emitChange();
    return canContinue;
  }

  isRoundComplete(players: EnginePlayer[]): boolean {
    return this.bettingEngine.isRoundComplete(players);
  }

  advanceDealer(): void {
    this.gameEngine.nextDealer();
    this.emitChange();
  }

  startBettingRound() {
    const engineState = this.gameEngine.getEngineState();
    const dealerIndex = engineState.players.findIndex(p => p.id === engineState.dealerId);
    const smallIndex = this.getNextActivePlayerIndex(engineState.players, dealerIndex);
    const bigIndex = smallIndex && this.getNextActivePlayerIndex(engineState.players, smallIndex);
    this.currentPlayerIndex = bigIndex && this.getNextActivePlayerIndex(engineState.players, bigIndex);
    this.bettingEngine.startBettingRound(engineState.players);
    this.emitChange();
  }
  // ---------------------------------------------------
  // Start a brand new hand with a supplied deck
  // ---------------------------------------------------
  resetHandWithDeck(deck: CardCode[]) {
    this.gameEngine.resetHandWithDeck(deck);
    this.publicState = this.getPublicState();
  }

  // ---------------------------------------------------
  // Start a brand new hand with a shuffled deck
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
        enginePlayers[i].folded = this.getEngineState() !== "Pre-Flop Bet";
      }
    }

    this.gameEngine.setPlayers(enginePlayers.slice(0, this.playerCount));

    this.publicState = this.gameEngine.getEngineState();
    this.emitChange();

  }


  private async initPreflopBlinds() {
    const engineState = this.gameEngine.getEngineState();
    const players = engineState.players;
    // Reset BettingEngine for new round
    this.bettingEngine.beginBettingRound(players);
    // --- Find dealer, small blind, big blind ---
    const dealerIndex = players.findIndex(p => p.id === engineState.dealerId);
    const smallIndex = this.getNextActivePlayerIndex(players, dealerIndex);
    const bigIndex = this.getNextActivePlayerIndex(players, smallIndex!);

    if (smallIndex == null || bigIndex == null) return;

    // --- 1. Small Blind posts automatically ---
    this.currentPlayerIndex = smallIndex;
    const smallBlindPlayer = this.getCurrentPlayer();
    if (smallBlindPlayer) {
      this.bettingEngine.postBlind(smallBlindPlayer, "pay-small-blind");
      this.emitChange();       // UI sees SB chip flash
      await this.wait(3000);   // 3s delay
    }

    // --- 2. Big Blind posts automatically ---
    this.currentPlayerIndex = bigIndex;
    const bigBlindPlayer = this.getCurrentPlayer();
    if (bigBlindPlayer) {
      this.bettingEngine.postBlind(bigBlindPlayer, "pay-big-blind");
      this.emitChange();       // UI sees BB chip flash
      await this.wait(3000);   // 3s delay
    }

    // --- 3. Start pre-flop betting ---
    const firstToActIndex = this.getNextActivePlayerIndex(players, bigIndex);
    this.currentPlayerIndex = firstToActIndex;

    this.emitChange();
  }



  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}


