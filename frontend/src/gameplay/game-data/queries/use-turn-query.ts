import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";

interface ApiTurn {
  id: string;
  teamName: string;
  status: string;
  guessesRemaining: number;
  createdAt: string;
  completedAt: string | null;
  clue: {
    word: string;
    number: number;
    createdAt: string;
  } | null;
  hasGuesses: boolean;
  lastGuess: {
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: string;
  } | null;
  prevGuesses: Array<{
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: string;
  }>;
}

interface TurnApiResponse {
  success: boolean;
  data: {
    turn: ApiTurn;
    historicTurns: ApiTurn[];
  };
}

/**
 * Detailed turn data with timestamps and full guess history.
 */
export interface TurnData {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: Date;
  completedAt: Date | null;
  clue: {
    word: string;
    number: number;
    createdAt: Date;
  } | null;
  hasGuesses: boolean;
  lastGuess: {
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: Date;
  } | null;
  prevGuesses: Array<{
    cardWord: string;
    playerName: string;
    outcome: string;
    createdAt: Date;
  }>;
}

/**
 * Response from turn query including historic turns
 */
export interface TurnQueryResult {
  turn: TurnData;
  historicTurns: TurnData[];
}

function transformApiTurn(apiTurn: ApiTurn): TurnData {
  return {
    id: apiTurn.id,
    teamName: apiTurn.teamName,
    status: apiTurn.status as "ACTIVE" | "COMPLETED",
    guessesRemaining: apiTurn.guessesRemaining,
    createdAt: new Date(apiTurn.createdAt),
    completedAt: apiTurn.completedAt ? new Date(apiTurn.completedAt) : null,
    clue: apiTurn.clue ? {
      word: apiTurn.clue.word,
      number: apiTurn.clue.number,
      createdAt: new Date(apiTurn.clue.createdAt)
    } : null,
    hasGuesses: apiTurn.hasGuesses,
    lastGuess: apiTurn.lastGuess ? {
      cardWord: apiTurn.lastGuess.cardWord,
      playerName: apiTurn.lastGuess.playerName,
      outcome: apiTurn.lastGuess.outcome,
      createdAt: new Date(apiTurn.lastGuess.createdAt)
    } : null,
    prevGuesses: apiTurn.prevGuesses.map(guess => ({
      cardWord: guess.cardWord,
      playerName: guess.playerName,
      outcome: guess.outcome,
      createdAt: new Date(guess.createdAt)
    })),
  };
}

const fetchTurn = async (turnId: string): Promise<TurnQueryResult> => {
  const response: AxiosResponse<TurnApiResponse> = await api.get(
    `/turns/${turnId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch turn data");
  }

  return {
    turn: transformApiTurn(response.data.data.turn),
    historicTurns: response.data.data.historicTurns.map(transformApiTurn),
  };
};

/**
 * Fetches detailed turn data including full guess history and all historic turns.
 */
export const useTurnDataQuery = (
  turnId: string | null,
): UseQueryResult<TurnQueryResult, Error> => {
  return useQuery<TurnQueryResult>({
    queryKey: ["turn", turnId],
    queryFn: async () => {
      if (!turnId) {
        throw new Error("Turn ID is required");
      }
      return await fetchTurn(turnId);
    },
    enabled: !!turnId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
