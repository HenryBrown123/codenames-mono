import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { TurnData } from "../queries/use-turn-query";

interface GiveClueApiResponse {
  success: boolean;
  data: {
    clue: {
      word: string;
      number: number;
      createdAt: string;
    };
    turn: {
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
    };
  };
}

interface GiveClueInput {
  word: string;
  targetCardCount: number;
  roundNumber: number;
}

export interface ClueGivenResult {
  clue: {
    word: string;
    number: number;
    createdAt: Date;
  };
  turn: TurnData; // Uses rich TurnData from use-turn-query
}


function transformApiResponseToClueGivenResult(apiResponse: GiveClueApiResponse): ClueGivenResult {
  const { clue, turn } = apiResponse.data;
  
  return {
    clue: {
      word: clue.word,
      number: clue.number,
      createdAt: new Date(clue.createdAt),
    },
    turn: {
      id: turn.id,
      teamName: turn.teamName,
      status: turn.status as "ACTIVE" | "COMPLETED",
      guessesRemaining: turn.guessesRemaining,
      createdAt: new Date(turn.createdAt),
      completedAt: turn.completedAt ? new Date(turn.completedAt) : null,
      clue: turn.clue ? {
        word: turn.clue.word,
        number: turn.clue.number,
        createdAt: new Date(turn.clue.createdAt)
      } : null,
      hasGuesses: turn.hasGuesses,
      lastGuess: turn.lastGuess ? {
        cardWord: turn.lastGuess.cardWord,
        playerName: turn.lastGuess.playerName,
        outcome: turn.lastGuess.outcome,
        createdAt: new Date(turn.lastGuess.createdAt)
      } : null,
      prevGuesses: turn.prevGuesses.map(guess => ({
        cardWord: guess.cardWord,
        playerName: guess.playerName,
        outcome: guess.outcome,
        createdAt: new Date(guess.createdAt)
      })),
    },
  };
}

/**
 * Submits a clue for the current turn.
 */
export const useGiveClueMutation = (
  gameId: string,
): UseMutationResult<ClueGivenResult, Error, GiveClueInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ word, targetCardCount, roundNumber }) => {
      const response: AxiosResponse<GiveClueApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/clues`,
        { word, targetCardCount },
      );

      if (!response.data.success) {
        throw new Error("Failed to give clue");
      }

      return transformApiResponseToClueGivenResult(response.data);
    },
    onSuccess: async (data) => {
      const turnData = data.turn;
      queryClient.setQueryData(["turn", turnData.id], turnData);
      await queryClient.refetchQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
