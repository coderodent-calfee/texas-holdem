import type { Game } from "../types/Game";
import { fakePlayers } from "./fakePlayers";

export const fakeGame: Game = {
  gameId: "TEST01",
  status: "active",
  players: fakePlayers,
};
