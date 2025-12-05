import { TurnStateProvider, ProviderTurnData } from "@backend/common/state/turn-state.provider";
import { TurnsFinder, RoundId, TurnResult } from "@backend/common/data-access/repositories/turns.repository";

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

export interface GetTurnResponse {
  turn: ApiTurnData;
  historicTurns: ApiTurnData[];
}

export type GetTurnService = (
  publicTurnId: string,
) => Promise<GetTurnResponse | null>;

/**
 * Transform a turn result from repository to API format
 */
const transformTurnToApi = (turn: TurnResult): ApiTurnData => {
  const guesses = turn.guesses.map((g) => ({
    cardWord: g.cardWord,
    playerName: g.playerName,
    outcome: g.outcome,
    createdAt: g.createdAt,
  }));

  const hasGuesses = guesses.length > 0;
  const lastGuess = hasGuesses ? guesses[guesses.length - 1] : undefined;
  const prevGuesses = hasGuesses ? guesses.slice(0, -1) : [];

  return {
    id: turn.publicId,
    teamName: turn.teamName,
    status: turn.status as "ACTIVE" | "COMPLETED",
    guessesRemaining: turn.guessesRemaining,
    createdAt: turn.createdAt,
    completedAt: turn.completedAt,
    clue: turn.clue
      ? {
          word: turn.clue.word,
          number: turn.clue.number,
          createdAt: turn.clue.createdAt,
        }
      : undefined,
    hasGuesses,
    lastGuess,
    prevGuesses,
  };
};

/**
 * Transform provider turn data to API format
 */
const transformProviderTurnToApi = (turnData: ProviderTurnData): ApiTurnData => ({
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
});

export interface GetTurnServiceDeps {
  getTurnState: TurnStateProvider;
  getTurnsByRoundId: TurnsFinder<RoundId>;
}

/**
 * Service for fetching turn data with historic turns for API response
 */
export const getTurnService =
  ({ getTurnState, getTurnsByRoundId }: GetTurnServiceDeps): GetTurnService =>
  async (publicTurnId) => {
    // Get turn data with computed fields from provider
    const turnData = await getTurnState(publicTurnId);

    if (!turnData) {
      return null;
    }

    // Fetch all turns for the same round
    const allTurns = await getTurnsByRoundId(turnData._roundId);

    // Transform to API format
    const turn = transformProviderTurnToApi(turnData);
    const historicTurns = allTurns.map(transformTurnToApi);

    return {
      turn,
      historicTurns,
    };
  };
