import { GameState, GameFormat, GameType, PlayerRole, RoundState } from "@codenames/shared/types";

export type { GameState, GameFormat, GameType, PlayerRole, RoundState } from "@codenames/shared/types";

/**
 * Core game aggregate containing all game state and metadata.
 * Used across multiple modules as the primary data structure.
 */
export interface GameData {
  publicId: string;
  status: GameState;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: Date;
  teams: Array<{
    name: string;
    score: number;
    players: Array<{
      publicId: string;
      name: string;
      isActive: boolean;
    }>;
  }>;
  currentRound: {
    roundNumber: number;
    status: RoundState;
    cards: Array<{
      word: string;
      selected: boolean;
      teamName: string | null;
      cardType: string;
    }>;
    turns: Array<{
      id: string;
      teamName: string;
      status: string;
      guessesRemaining: number;
      clue?: {
        word: string;
        number: number;
      };
      guesses: Array<{
        playerName: string;
        outcome: string | null;
      }>;
    }>;
  } | null;
  playerContext: {
    playerName: string;
    teamName: string;
    role: PlayerRole;
  } | null;
}

export interface Card {
  word: string;
  selected: boolean;
  teamName: string | null;
  cardType: string;
}

export interface Turn {
  id: string;
  teamName: string;
  status: string;
  guessesRemaining: number;
  clue?: {
    word: string;
    number: number;
  };
  guesses: Array<{
    playerName: string;
    outcome: string | null;
  }>;
}

export type { TurnData } from "../gameplay/api/queries/use-turn-query";