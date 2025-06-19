import { TurnStateProvider } from "../state/turn-state.provider";

/**
 * API response turn data (sanitized - no internal IDs)
 */
export interface ApiTurnData {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: Date;
  completedAt: Date | null;
  clue?: {
    word: string;
    number: number;
    createdAt: Date;
  };
  hasGuesses: boolean;
  lastGuess?: {
    cardWord: string;
    playerName: string;
    outcome: string | null;
    createdAt: Date;
  };
  prevGuesses: {
    cardWord: string;
    playerName: string;
    outcome: string | null;
    createdAt: Date;
  }[];
}

export type GetTurnService = (
  publicTurnId: string,
) => Promise<ApiTurnData | null>;

class UnauthorizedTurnAccessError extends Error {
  constructor() {
    super("Turn does not belong to the specified game");
    this.name = "UnauthorizedTurnAccessError";
  }
}

/**
 * Service for auth checking and sanitizing turn data for API response
 */
export const getTurnService =
  (getTurnState: TurnStateProvider): GetTurnService =>
  async (publicTurnId) => {
    // Get turn data with computed fields from provider
    const turnData = await getTurnState(publicTurnId);

    if (!turnData) {
      return null;
    }

    // Return sanitized data for API response (manually constructed for type & data safety)
    return {
      id: turnData.publicId,
      teamName: turnData.teamName,
      status: turnData.status,
      guessesRemaining: turnData.guessesRemaining,
      createdAt: turnData.createdAt,
      completedAt: turnData.completedAt,
      clue: turnData.clue,
      hasGuesses: turnData.hasGuesses,
      lastGuess: turnData.lastGuess,
      prevGuesses: turnData.prevGuesses,
    };
  };
