import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";
import type { TurnData, TurnPhase } from "@frontend/shared-types";
import { assertPlayerRole } from "@frontend/shared-types";
import { GAME_TYPE } from "@codenames/shared/types";
import { usePlayerSession } from "../../game-data/providers/active-game-session-provider";
import { useGameDataRequired } from "../../game-data/providers";
import { useViewMode } from "../../game-board/view-mode/view-mode-context";

interface ApiTurnActive {
  teamName: string;
  role: string;
  isAi: boolean;
  playerName: string | null;
}

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
      active: ApiTurnActive | null;
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
  turn: TurnData;
}

function transformActiveTurnPhase(raw: ApiTurnActive | null): TurnPhase | null {
  if (!raw) return null;
  assertPlayerRole(raw.role);
  return { teamName: raw.teamName, role: raw.role, isAi: raw.isAi, playerName: raw.playerName };
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
        createdAt: new Date(turn.clue.createdAt),
      } : null,
      hasGuesses: turn.hasGuesses,
      lastGuess: turn.lastGuess ? {
        cardWord: turn.lastGuess.cardWord,
        playerName: turn.lastGuess.playerName,
        outcome: turn.lastGuess.outcome,
        createdAt: new Date(turn.lastGuess.createdAt),
      } : null,
      prevGuesses: turn.prevGuesses.map(guess => ({
        cardWord: guess.cardWord,
        playerName: guess.playerName,
        outcome: guess.outcome,
        createdAt: new Date(guess.createdAt),
      })),
      active: transformActiveTurnPhase(turn.active),
    },
  };
}

/**
 * Submits a clue for the current turn.
 */
export const useGiveClueMutation = (
  gameId: string,
): UseMutationResult<ClueGivenResult, Error, GiveClueInput> => {
  const { claimedRole } = usePlayerSession();
  const { gameData } = useGameDataRequired();
  const { setViewMode } = useViewMode();

  const isSingleDevice = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;

  return useMutation({
    mutationFn: async ({ word, targetCardCount, roundNumber }) => {
      const body = isSingleDevice
        ? { role: claimedRole, word, targetCardCount }
        : { playerId: gameData.playerContext!.publicId, word, targetCardCount };

      const response: AxiosResponse<GiveClueApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/clues`,
        body,
      );

      if (!response.data.success) {
        throw new Error("Failed to give clue");
      }

      return transformApiResponseToClueGivenResult(response.data);
    },
    onSuccess: async () => {
      setViewMode("normal");
    },
  });
};
