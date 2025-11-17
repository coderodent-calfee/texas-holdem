export interface Player {
    playerId: string;
    name: string;
    game_identifier: string;
    userId: string;
    isActive?: string; // indicates if they are disconnected from the socket 
    avatarId?: string;
    // 
    // any other fields 
}