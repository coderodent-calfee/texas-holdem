import { BACK, CardCode } from "../utils/loadCards";
import type { Player, TableState } from "../types/table";

export const testTableState: TableState = {
  pot: 150,
  liveBet: 10,
  communityCards: ["AS", "KD", "TH"],
  players: [
    {
      id: '1',
      name: 'Alice',
      chips: 500,
      active: true,
      isDealer: true,
      isSmallBlind: false,
      isBigBlind: false,
      holeCards: [BACK, BACK],
    },
    {
      id: '2',
      name: 'Bob',
      chips: 320,
      active: true,
      isDealer: false,
      isSmallBlind: true,
      isBigBlind: false,
      holeCards: [BACK, BACK],
    },
    {
      id: '3',
      name: 'Carol',
      chips: 750,
      active: true,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: true,
      holeCards: [BACK, BACK],
    },
    {
      id: '4',
      name: 'Dave',
      chips: 0,
      active: false,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      holeCards: [BACK, BACK],
    },
  ],
};

