import type { TexasHoldem  } from "../types/table";

export function createInitialTableState(players: TexasHoldem.Player[]): TexasHoldem.TableState {
  return {
    pot: 0,
    liveBet: 0,
    communityCards: [],
    players: players.map(p => ({
      ...p,
    })),
  };
}
