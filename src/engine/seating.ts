// src/engine/seatPlayers.ts
import { EnginePlayer } from "./TexasHoldemEngine";

export interface SeatingMap {
  top: EnginePlayer[];
  bottom: EnginePlayer[];
  left: EnginePlayer[];
  right: EnginePlayer[];
}

/**
 * Distributes players around the table into virtual seating positions:
 * top, bottom, left, right.
 *
 * Designed to mimic actual clockwise poker seating.
 */
export function seatPlayers(players: EnginePlayer[]): SeatingMap {
  const seating: SeatingMap = {
    top: [],
    bottom: [],
    left: [],
    right: []
  };

  if (!players || players.length === 0) {
    return seating;
  }

  // --- Special case: heads up ---
  if (players.length === 2) {
    seating.bottom.push(players[0]);
    seating.top.push(players[1]);
    return seating;
  }

  // --- Special case: 3 players ---
  if (players.length === 3) {
    seating.bottom.push(players[0]);
    seating.top.push(players[1]);
    seating.top.push(players[2]);
    return seating;
  }

  // --- 4+ players general distribution ---
  // --- two separate controls: addOrder (for counting) and seatOrder (for assignment)
  type SeatKey = keyof SeatingMap;
  const addOrder: SeatKey[] = Object.keys(seating) as SeatKey[]; // e.g. ["top","bottom","left","right"]
  const seatOrder: SeatKey[] = ["bottom", "left", "top", "right"]; // assignment order

  // Phase 1: count how many go in each section using addOrder (round-robin counting)
  const seatingCount: Record<SeatKey, number> = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  players.forEach((_, idx) => {
    const seatForCount = addOrder[idx % addOrder.length];
    seatingCount[seatForCount] += 1;
  });

  // Phase 2: assign players into seatOrder, filling each section fully before moving on
  let currentSeatIndex = 0;
  for (const p of players) {
    const destSeat = seatOrder[currentSeatIndex];
    seating[destSeat].push(p);

    if (seating[destSeat].length >= seatingCount[destSeat]) {
      currentSeatIndex += 1;
    }
  }

  // Reverse bottom and left for a more natural clockwise layout
  seating.bottom.reverse();
  seating.left.reverse();

  return seating;
}
