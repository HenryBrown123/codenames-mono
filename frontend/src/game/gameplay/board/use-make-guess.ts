import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import type { TurnData, TurnPhase } from "@frontend/shared/types";
import { assertPlayerRole } from "@frontend/shared/types";
import { GAME_TYPE } from "@codenames/shared/types";
import { usePlayerSession } from "../providers/active-game-session-provider";
import { useGameDataRequired } from "../providers";

interface ApiTurnActive {
  teamName: string;
  role: string;
  isAi: boolean;
  playerName: string | null;
}

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
      active: ApiTurnActive | null;
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
  turn: TurnData;
}

function transformActiveTurnPhase(raw: ApiTurnActive | null): TurnPhase | null {
  if (!raw) return null;
  assertPlayerRole(raw.role);
  return { teamName: raw.teamName, role: raw.role, isAi: raw.isAi, playerName: raw.playerName };
}

/**
 * Submits a guess for a card.
 */
export const useMakeGuessMutation = (
  gameId: string,
): UseMutationResult<GuessResult, Error, MakeGuessInput> => {
  const { claimedRole } = usePlayerSession();
  const { gameData } = useGameDataRequired();

  const isSingleDevice = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;

  return useMutation({
    mutationFn: async ({ cardWord, roundNumber }) => {
      const body = isSingleDevice
        ? { role: claimedRole, cardWord }
        : { playerId: gameData.playerContext!.publicId, cardWord };

      const response: AxiosResponse<MakeGuessApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/guesses`,
        body,
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
            createdAt: new Date(turn.clue.createdAt),
          } : null,
          hasGuesses: turn.hasGuesses,
          lastGuess: turn.lastGuess ? {
            cardWord: turn.lastGuess.cardWord,
            playerName: turn.lastGuess.playerName,
            outcome: turn.lastGuess.outcome,
            createdAt: new Date(turn.lastGuess.createdAt),
          } : null,
          prevGuesses: turn.prevGuesses.map(g => ({
            cardWord: g.cardWord,
            playerName: g.playerName,
            outcome: g.outcome,
            createdAt: new Date(g.createdAt),
          })),
          active: transformActiveTurnPhase(turn.active),
        },
      };
    },
    onSuccess: async () => {
      // Invalidation handled by GameActionsProvider.invalidateGameData()
    },
  });
};
