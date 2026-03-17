import { useQuery, UseQueryResult, keepPreviousData } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";
import type { GameData, Round, PlayerContext } from "@frontend/shared-types";
import {
  assertGameState,
  assertGameFormat,
  assertGameType,
  assertRoundState,
  assertPlayerRole,
  assertTurnStatus,
} from "@frontend/shared-types";
import { usePlayerContext } from "../providers/player-context-provider";

interface GameStateApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      status: string;
      gameType: string;
      gameFormat: string;
      createdAt: string;
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
        status: string;
        winningTeamName: string | null;
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
            cardWord: string;
            playerName: string;
            outcome: string | null;
          }>;
        }>;
      } | null;
      playerContext: {
        publicId: string;
        playerName: string;
        teamName: string;
        role: string;
      } | null;
    };
  };
}

/**
 * Transforms the raw API response into typed GameData.
 * Assertions run at the boundary — if the backend sends invalid enum
 * values, this throws immediately. Catch it in tests, not in prod.
 */
function transformApiResponseToGameData(apiResponse: GameStateApiResponse): GameData {
  const game = apiResponse.data.game;

  assertGameState(game.status);
  assertGameType(game.gameType);
  assertGameFormat(game.gameFormat);

  let currentRound: Round | null = null;
  if (game.currentRound) {
    assertRoundState(game.currentRound.status);
    currentRound = {
      roundNumber: game.currentRound.roundNumber,
      status: game.currentRound.status,
      winningTeamName: game.currentRound.winningTeamName,
      cards: game.currentRound.cards,
      turns: game.currentRound.turns.map((turn) => {
        assertTurnStatus(turn.status);
        return {
          id: turn.id,
          teamName: turn.teamName,
          status: turn.status,
          guessesRemaining: turn.guessesRemaining,
          clue: turn.clue,
          guesses: turn.guesses,
        };
      }),
    };
  }

  let playerContext: PlayerContext | null = null;
  if (game.playerContext) {
    assertPlayerRole(game.playerContext.role);
    playerContext = {
      publicId: game.playerContext.publicId,
      playerName: game.playerContext.playerName,
      teamName: game.playerContext.teamName,
      role: game.playerContext.role,
    };
  }

  return {
    publicId: game.publicId,
    status: game.status,
    gameType: game.gameType,
    gameFormat: game.gameFormat,
    createdAt: new Date(game.createdAt),
    teams: game.teams.map((team) => ({
      name: team.name,
      score: team.score,
      players: team.players.map((player) => ({
        publicId: player.publicId,
        name: player.name,
        isActive: player.isActive,
      })),
    })),
    currentRound,
    playerContext,
  };
}

const fetchGame = async (gameId: string, playerId?: string): Promise<GameData> => {
  const response: AxiosResponse<GameStateApiResponse> = await api.get(`/games/${gameId}`, {
    params: playerId ? { playerId } : undefined,
  });

  if (!response.data.success) {
    throw new Error("Failed to fetch game data");
  }

  console.log(response.data.data.game);

  return transformApiResponseToGameData(response.data);
};

/**
 * Fetches and caches game state data.
 */
export const useGameDataQuery = (gameId: string | null): UseQueryResult<GameData, Error> => {
  const { currentPlayerId } = usePlayerContext();

  return useQuery<GameData>({
    queryKey: ["gameData", gameId, currentPlayerId], // null playerId is valid for cache key
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      // Pass undefined if no playerId - backend returns NONE role view
      return fetchGame(gameId, currentPlayerId || undefined);
    },
    enabled: !!gameId, // Don't wait for playerId - run with null to get NONE role
    refetchOnWindowFocus: true,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};
