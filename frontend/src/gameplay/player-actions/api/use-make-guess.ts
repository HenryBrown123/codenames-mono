import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { TurnData } from "../../shared/api/use-turn-query";
import { usePlayerContext } from "../../shared/providers/player-context-provider";

interface MakeGuessApiResponse {
  success: boolean;
  data: {
    guess: {
      cardWord: string;
      outcome: string;
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

interface MakeGuessInput {
  cardWord: string;
  roundNumber: number;
}

export interface GuessResult {
  guess: {
    cardWord: string;
    outcome: string;
    createdAt: Date;
  };
  turn: TurnData; // Uses rich TurnData from use-turn-query
}

/**
 * Submits a guess for a card.
 */
export const useMakeGuessMutation = (
  gameId: string,
): UseMutationResult<GuessResult, Error, MakeGuessInput> => {
  const queryClient = useQueryClient();
  const { currentPlayerId } = usePlayerContext();

  return useMutation({
    mutationFn: async ({ cardWord, roundNumber }) => {
      if (!currentPlayerId) {
        throw new Error("Player ID is required to make guess");
      }

      const response: AxiosResponse<MakeGuessApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/guesses`,
        { cardWord, playerId: currentPlayerId },
      );

      if (!response.data.success) {
        throw new Error("Failed to make guess");
      }

      const { guess, turn } = response.data.data;
      
      return {
        guess: {
          cardWord: guess.cardWord,
          outcome: guess.outcome,
          createdAt: new Date(guess.createdAt),
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
          prevGuesses: turn.prevGuesses.map(g => ({
            cardWord: g.cardWord,
            playerName: g.playerName,
            outcome: g.outcome,
            createdAt: new Date(g.createdAt)
          })),
        },
      };
    },
    onSuccess: async (data) => {
      const turnData = data.turn;
      queryClient.setQueryData(["turn", turnData.id], turnData);
      await queryClient.refetchQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
