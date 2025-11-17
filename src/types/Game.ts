import { Player } from "./Player";

export interface Game { 
    gameId: string; 
    players: Player[]; 
    status: "waiting" | "active" | "finished"; 
    creatorId?: string; 
}