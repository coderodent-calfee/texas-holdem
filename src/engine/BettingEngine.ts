// BettingEngine.ts
import type { EnginePlayer } from "./TexasHoldemEngine";

export const BETTING_ACTIONS = [
    "check",
    "call",
    "bet",
    "raise",
    "fold",
] as const;
export type BettingAction = (typeof BETTING_ACTIONS)[number];

export const SPECIAL_ACTIONS = [
    "pay-small-blind",
    "pay-big-blind",
    "claim-winnings",
] as const;
export type SpecialAction = (typeof SPECIAL_ACTIONS)[number];

export type PlayerAction =
    | BettingAction
    | SpecialAction;

// (bettingMode === "bet")?{allowedMoves?.minBet ?? 0} :{allowedMoves?.minBet ?? 0}
export interface AllowedActions {
    canFold: boolean;
    canCheck: boolean;
    canCall: boolean;
    canBet: boolean;
    canRaise: boolean;

    // Amounts (null if not applicable)
    callAmount: number | null;     // how much needed to call
    minBet: number | null;         // minimum opening bet
    minRaise: number | null;       // minimum raise *increment*
    maxBet: number;             // player's all-in cap

    // helper: Is player allowed to go all-in (always true unless already all-in)
    canAllIn: boolean;
    canPaySmallBlind?: boolean;
    canPayBigBlind?: boolean;
    canClaimWinnings?: boolean;
}

export const noActions: AllowedActions = {
    canFold: false,
    canCheck: false,
    canCall: false,
    canBet: false,
    canRaise: false,

    callAmount: null,
    minBet: null,
    minRaise: null,
    maxBet: 0,

    canAllIn: false,
    canClaimWinnings: false,
};

export interface BettingEngineState {
    pot: number;
    toCall: number;
    lastRaise: number;
    lastAggressor: string | null;
    bigBlind: number;
    roundComplete: boolean;
    actedThisRound: Set<string>;
}


export class BettingEngine {
    private state: BettingEngineState;
    constructor(bigBlind: number = 4) {
        this.state = {
            pot: 0,
            toCall: 0,
            lastRaise: bigBlind,
            lastAggressor: null,

            bigBlind,

            roundComplete: false,
            actedThisRound: new Set<string>(),
        };
    }

    getAllowedActions(player: EnginePlayer): AllowedActions {
        console.log("getAllowedActions");

        const { toCall, lastRaise } = this.state;
        const committed = player.committed;
        const chips = player.chips;

        // Player is facing a bet if their committed amount is below the highest committed
        const facing = committed < toCall;

        // Amount needed to call
        const callAmount = facing ? Math.min(chips, toCall - committed) : 0;

        // Fold is always allowed unless player is already all-in
        const canFold = chips > 0;

        // --- Check / Call ---
        const canCheck = !facing && chips > 0;
        const canCall = facing && chips > 0;

        // --- Bet / Raise ---
        let canBet = false;
        let canRaise = false;

        // Min bet / raise amounts (null if not applicable)
        let minBet: number | null = null;
        let minRaise: number | null = null;

        if (!facing) {
            //
            // ********** BETTING ROUND IS UNOPENED **********
            // Player may open the betting with a bet
            //
            canBet = chips > 0;
            minBet = Math.min(chips, this.state.bigBlind); // standard rule
            minRaise = null; // no raise because no bet exists yet
        } else {
            //
            // ********** PLAYER IS FACING A BET **********
            // Player may raise if they have enough chips to at least call first
            //
            const amountNeededToCall = toCall - committed;

            // Player must be able to call before raising
            if (chips > amountNeededToCall) {
                canRaise = true;

                // Legal minimum total raise:
                //   newBet = toCall + lastRaise
                //
                const totalNeeded = (toCall - committed) + lastRaise;
                minRaise = Math.min(chips, totalNeeded);

                minBet = null; // betting is closed; only raises make sense
            }
        }

        // Max amount is always player's stack (all-in cap)
        const maxAmount = chips;

        return {
            canFold,
            canCheck,
            canCall,
            canBet,
            canRaise,

            callAmount: facing ? callAmount : null,
            minBet,
            minRaise,
            maxBet: maxAmount,

            canAllIn: chips > 0
        };
    }

    _validatePlayerAction(
        player: EnginePlayer | null,
        action: PlayerAction,
        amount?: number
    ): boolean {
        console.log("_validatePlayerAction -- ?");

        if (!player) {
            console.log("VALIDATION FAIL: no player");
            return false;
        }

        const allowed = this.getAllowedActions(player);
        const committed = player.committed;
        const chips = player.chips;
        const betting = this.getState();
        const toCall = betting.toCall;
        const facingBet = committed < toCall;

        // --- FOLD ---
        if (action === "fold") {
            if (!allowed.canFold) {
                console.log("VALIDATION FAIL: fold not allowed");
                return false;
            }
            return true;
        }

        // --- CHECK ---
        if (action === "check") {
            if (!allowed.canCheck) {
                console.log("VALIDATION FAIL: check not allowed");
                return false;
            }
            return true;
        }

        // --- CALL ---
        if (action === "call") {
            if (!allowed.canCall) {
                console.log("VALIDATION FAIL: call not allowed");
                return false;
            }

            if (chips <= 0) {
                console.log("VALIDATION FAIL: cannot call with 0 chips");
                return false;
            }

            return true;
        }

        // --- BET ---
        if (action === "bet") {
            if (!allowed.canBet) {
                console.log("VALIDATION FAIL: bet not allowed");
                return false;
            }

            if (amount === undefined) {
                console.log("VALIDATION FAIL: bet requires amount");
                return false;
            }
            if (allowed.minBet === null) {
                console.log("VALIDATION FAIL: bet requires minBet");
                return false;
            }
            if (amount < allowed.minBet) {
                console.log(
                    `VALIDATION FAIL: bet amount ${amount} < minBet ${allowed.minBet}`
                );
                return false;
            }

            if (amount > chips) {
                console.log(
                    `VALIDATION FAIL: bet amount ${amount} > chips ${chips}`
                );
                return false;
            }

            return true;
        }

        // --- RAISE ---
        if (action === "raise") {
            if (!allowed.canRaise) {
                console.log("VALIDATION FAIL: raise not allowed");
                return false;
            }

            if (amount === undefined) {
                console.log("VALIDATION FAIL: raise requires amount");
                return false;
            }

            if (!facingBet) {
                console.log("VALIDATION FAIL: cannot raise without facing a bet");
                return false;
            }

            const callPart = toCall - committed;
            const raisePart = amount - callPart;

            console.log(`VALIDATION: action ${action} amount ${amount} committed ${committed} toCall ${toCall} chips ${chips} callPart ${callPart} raisePart ${raisePart} `);

            if (amount < callPart) {
                console.log(
                    `VALIDATION FAIL: raise amount ${amount} does not cover call ${callPart}`
                );
                return false;
            }
            if (allowed.minRaise === null) {
                console.log("VALIDATION FAIL: raise requires minRaise");
                return false;
            }
            if ((raisePart < allowed.minRaise) && (amount < chips)) {
                console.log(
                    `VALIDATION FAIL: raisePart ${raisePart} < allowed.minRaise ${allowed.minRaise} && amount ${amount} < chips ${chips} `
                );
                return false;
            }

            if (amount > chips) {
                console.log(
                    `VALIDATION FAIL: raise amount ${amount} > chips ${chips}`
                );
                return false;
            }

            return true;
        }

        console.log(`VALIDATION FAIL: unknown action '${action}'`);
        return false;
    }

    applyPlayerAction(player: EnginePlayer | null, action: PlayerAction, amount?: number): boolean {
        if (!player) return false;
        if (!this._validatePlayerAction(player, action, amount)) return false;

        const state = this.state;
        const toCallBefore = state.toCall;    // key for raise math
        const committedBefore = player.committed;

        switch (action) {

            case "fold":
                player.folded = true;
                state.actedThisRound.add(player.id);
                return true;

            case "check":
                state.actedThisRound.add(player.id);
                return true;

            case "call": {
                const amountNeeded = toCallBefore - committedBefore;
                const callAmount = Math.min(player.chips, amountNeeded);

                player.chips -= callAmount;
                player.committed += callAmount;
                state.pot += callAmount;
                // calling never changes lastRaise or lastAggressor
                state.actedThisRound.add(player.id);
                return true;
            }

            case "bet": {
                const betAmount = amount!;  // total bet amount

                // Player is betting from zero commitment (unopened round)
                player.chips -= betAmount;
                player.committed += betAmount;
                state.pot += betAmount;

                state.lastRaise = betAmount;   // opening bet sets the raise size
                state.toCall = player.committed;
                state.lastAggressor = player.id;

                state.actedThisRound.clear();
                state.actedThisRound.add(player.id);
                return true;
            }

            case "raise": {
                const totalPutIn = amount!;
                // totalPutIn = callPart + raisePart

                player.chips -= totalPutIn;
                player.committed += totalPutIn;
                state.pot += totalPutIn;

                // raise amount = how much MORE the new total exceeds previous toCall
                const raiseAmount = player.committed - toCallBefore;

                state.lastRaise = raiseAmount;
                state.toCall = player.committed;
                state.lastAggressor = player.id;

                state.actedThisRound.clear();
                state.actedThisRound.add(player.id);
                return true;
            }

            default:
                return false;
        }
    }

    applyPlayerSpecialAction(player: EnginePlayer | undefined, action: SpecialAction): boolean {
        if (!player) {
            console.log("applyPlayerSpecialAction no player");
            return false;
        }
        console.log(`applyPlayerSpecialAction ${player.name} `, player);

        if ((player.isBigBlind) === (action !== "pay-big-blind")) {
            console.log(`applyPlayerSpecialAction ${action} player is not big blind`);
            return false;
        }
        if ((player.isSmallBlind) === (action !== "pay-small-blind")) {
            console.log(`applyPlayerSpecialAction ${action} player is not small blind`);
            return false;
        }
        const state = this.state;

        if (state.actedThisRound.has(player.id)) {
            console.log(`applyPlayerSpecialAction ${action} player has acted`);
            return false;
        }
        let blindAmount = 0;
        switch (action) {
            case "pay-small-blind":
                blindAmount = Math.min(player.chips, state.bigBlind / 2);
                break;
            case "pay-big-blind":
                blindAmount = Math.min(player.chips, state.bigBlind);
                break;
            default:
                return false;
        }
        player.chips -= blindAmount;
        player.committed += blindAmount;
        state.pot += blindAmount;
        state.actedThisRound.add(player.id);

        if (state.actedThisRound.size === 2) {
            state.toCall = state.bigBlind;
            state.lastRaise = state.bigBlind;
        }
        return true;
    }

    _evaluateRoundCompletion(players: EnginePlayer[]): void {
        const activePlayers = players.filter(p => !p.folded);

        // If only one player still active → done
        if (activePlayers.length <= 1) {
            this.state.roundComplete = true;
            return;
        }

        // Everyone must match toCall or be all-in
        const everyoneMatched = activePlayers.every(
            p => p.committed === this.state.toCall || p.chips === 0
        );

        if (!everyoneMatched) {
            return; // cannot end yet
        }

        // Everyone who is still active must have acted this round
        const allActed = activePlayers.every(p =>
            this.state.actedThisRound.has(p.id)
        );

        if (allActed) {
            this.state.roundComplete = true;
        }
    }


    getState(): BettingEngineState {
        return { ...this.state };
    }

    /** begin betting is for transition to the betting from blinds */
    beginBettingRound(players: EnginePlayer[]) {
        this.state.roundComplete = false;
        this.state.lastRaise = this.state.bigBlind;
        this.state.lastAggressor = null;
        // Reset per-player committed bets for this round
        players.forEach((p) => {
            p.committed = 0;
        });
        this.state.actedThisRound = new Set<string>();
    }

    startBettingRound(players: EnginePlayer[]) {
        this.beginBettingRound(players)
        this.state.toCall = 0;
    }


    isRoundComplete(players: EnginePlayer[]): boolean {
        if (!this.state.roundComplete) {
            this._evaluateRoundCompletion(players);
        }
        return this.state.roundComplete;
    }

    distributePot(winner: EnginePlayer, share:number): void {
        winner.chips += share;
        this.state.pot -= share;
    }
}
