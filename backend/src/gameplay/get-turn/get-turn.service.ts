import { TurnStateProvider } from "../state/turn-state.provider";

/**
 * API response turn data (sanitized - no internal IDs)
 */
export interface ApiTurnData {
  publicId: string;
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
  publicId: string,
  gameId: number,
  userId: number,
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
  async (publicId, gameId, userId) => {
    // Get turn data with computed fields from provider
    const turnData = await getTurnState(publicId);

    if (!turnData) {
      return null;
    }

    // Auth check: turn must belong to the authorized game.... the users ability to access the game
    // has already been auth'ed via middleware.
    if (turnData._gameId !== gameId) {
      throw new UnauthorizedTurnAccessError();
    }

    // Return sanitized data for API response (manually constructed for type safety)
    return {
      publicId: turnData.publicId,
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
