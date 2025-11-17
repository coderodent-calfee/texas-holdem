// src/types/table
import { CardCode } from "src/utils/loadCards";

// src/types/table.ts
export namespace TexasHoldem {
    export interface Player {
        base: import("../types/Player").Player; // your global Player type

        chips: number;
        active: boolean; // playing, folded, busted, or not connected
        isDealer: boolean;
        isSmallBlind: boolean;
        isBigBlind: boolean;
        holeCards: CardCode[],
    }

    export interface TableState {
        players: Player[];
        pot: number;
        liveBet: number;

        // array of card codes like "AS" or "TD"
        communityCards: string[];
    }
}