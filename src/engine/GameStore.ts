import { CardCode } from "../utils/loadCards";
import type { Game } from "../types/Game";
import type { TexasHoldem  } from "../types/table";


export interface GameStore {
  getGame(): Game;
  getPlayers(): TexasHoldem.Player[];
  getState(): TexasHoldem.TableState;

  updateState(updater: (s: TexasHoldem.TableState) => void): void;

  getDeck(): CardCode[];
  shuffleDeck(): void;
}
