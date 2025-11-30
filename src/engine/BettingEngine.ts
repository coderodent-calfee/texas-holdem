// BettingEngine.ts
import type { EnginePlayer } from "./TexasHoldemEngine";
export const BETTING_ACTIONS = [
    "check",
    "call",
    "bet",
    "raise",
    "fold",
] as const;

export type PlayerAction = (typeof BETTING_ACTIONS)[number];

export interface AllowedActions {
    canCheck: boolean;     // Player may check (no bet to call)
    canCall: boolean;      // Player may call (facing a bet)
    canBet: boolean;       // Player may place the first bet of a round
    canRaise: boolean;     // Player may raise an existing bet
    minBet: number;        // Minimum legal bet or raise amount
    maxBet: number | null; // Maximum bet (chips or null for all-in allowed)
    canFold: boolean;      // Player may fold
}


interface BettingEngineState {
    pot: number;
    toCall: number;
    lastRaiseSize: number;
    lastAggressor: string | null;
    bigBlind: number;
    roundComplete: boolean;
}


export class BettingEngine {
    private state: BettingEngineState;
    constructor(bigBlind: number = 4) {
        this.state = {
            pot: 0,
            toCall: 0,
            lastRaiseSize: bigBlind,
            lastAggressor: null,

            bigBlind,

            roundComplete: false,
        };
    }

    getAllowedActions(player: EnginePlayer): AllowedActions {
        // --- Invalid or folded player ---
        if (!player || player.folded) {
            return {
                canCheck: false,
                canCall: false,
                canBet: false,
                canRaise: false,
                minBet: 0,
                maxBet: null,
                canFold: false,
            };
        }

        const committed = player.committed;
        const chips = player.chips;
        const toCall = this.state.toCall;
        const facingBet = committed < toCall;

        // Fold is always allowed (even if checking is available)
        const canFold = true;

        // --- Check / Call ---
        const canCheck = !facingBet;
        const canCall = facingBet && chips > 0;

        // Amount required to *fully* call
        const callAmount = Math.min(chips, toCall - committed);

        // --- Betting / Raising ---
        let canBet = false;
        let canRaise = false;
        let minBet = 0;
        let maxBet: number | null = chips; // all-in always possible

        if (!facingBet) {
            //
            // *** BETTING: no one has bet yet ***
            //
            canBet = chips > 0;

            // Typical rule: min opening bet = big blind
            const bigBlind = this.state.bigBlind;
            minBet = Math.min(chips, bigBlind);
        } else {
            //
            // *** RAISING: a bet exists ***
            //

            // The size of the last bet or raise (NLHE rule)
            const minRaise = this.state.minBet;

            // The minimum *total* amount the player must put in
            const raiseRequired = (toCall - committed) + minRaise;

            // Player must have enough to at least call before a raise
            canRaise = chips > (toCall - committed);

            minBet = Math.min(chips, raiseRequired);
        }

        return {
            canCheck,
            canCall,
            canBet,
            canRaise,
            minBet,
            maxBet,
            canFold,
        };
    }

    _validatePlayerAction(
        player: EnginePlayer | null,
        action: PlayerAction,
        amount?: number
    ): boolean {

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
            console.log(`VALIDATION: action ${action} amount ${amount} committed ${committed} toCall ${toCall} chips ${chips}callPart ${callPart} raisePart ${raisePart} `);

            if (amount < callPart) {
                console.log(
                    `VALIDATION FAIL: raise amount ${amount} does not cover call ${callPart}`
                );
                return false;
            }

            if (raisePart < allowed.minBet && amount < chips) {
                console.log(
                    `VALIDATION FAIL: raise amount ${raisePart} < minBet ${allowed.minBet}`
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
        if (!player) {
            return false;
        }
        if (!this._validatePlayerAction(player, action, amount)) {
            return false;
        }
        // --- Apply action --- 
        switch (action) {
            case "fold":
                player.folded = true;
                break;
            case "check": // nothing to do 
                break;
            case "call":
                const toCall = this.state.toCall - player.committed;
                const callAmount = Math.min(toCall, player.chips);
                player.chips -= callAmount;
                player.committed += callAmount;
                this.state.pot += callAmount;
                break;
            case "bet":
                const betAmount = Math.min(amount!, player.chips);
                player.chips -= betAmount;
                player.committed += betAmount;
                this.state.toCall = betAmount;
                this.state.minBet = betAmount;
                this.state.pot += betAmount;
                break;
            case "raise":
                const totalContribution = Math.min(amount!, player.chips);   // e.g., 200
                const callPart = this.state.toCall - player.committed;
                const raisePart = totalContribution - callPart;             // e.g., 100

                // Apply the actual contribution
                player.chips -= totalContribution;
                player.committed += totalContribution;
                this.state.toCall = this.state.toCall + raisePart;   // toCall increases only by the RAISE
                this.state.minBet = raisePart;            // minBet = size of raise ONLY
                this.state.pot += totalContribution;

                break;
            default:
                return false;
        }

        return true;

    }
    _evaluateRoundCompletion(players: EnginePlayer[]): void {
        const activePlayers = players.filter(p => !p.folded);
        const allInPlayers = activePlayers.filter(p => p.chips === 0);

        const needAction = activePlayers.some(p =>
            !p.folded &&
            p.chips > 0 &&
            p.committed !== this.state.toCall
        );

        if (activePlayers.length <= 1 || !needAction) {
            this.state.roundComplete = true;
        }
    }

    getState(): BettingEngineState {
        return { ...this.state };
    }

    /** Begin a new betting round (flop/turn/river) */
    beginNewBettingRound(players: EnginePlayer[]) {
        this.state.roundComplete = false;
        this.state.toCall = 0;
        this.state.minBet = 0;

        // Reset per-player committed bets for this round
        players.forEach((p) => {
            p.committed = 0;
        });
    }

    isRoundComplete(players: EnginePlayer[]): boolean {
        if (!this.state.roundComplete) {
            this._evaluateRoundCompletion(players);
        }
        return this.state.roundComplete;
    }
}
