import { CardCode } from "src/utils/loadCards";

// src/types/table.ts
export interface Player {
    id: string;
    name: string;
    chips: number;
    active: boolean;

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
