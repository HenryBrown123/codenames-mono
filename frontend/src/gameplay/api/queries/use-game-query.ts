import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GameData } from "@frontend/shared-types/domain-types";
import { usePlayerContext } from "../../player-context/player-context.provider";

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
        role: string;
      };
    };
  };
}

function transformApiResponseToGameData(apiResponse: GameStateApiResponse): GameData {
  const game = apiResponse.data.game;

  return {
    publicId: game.publicId,
    status: game.status as any, // Will be validated by backend
    gameType: game.gameType as any, // Will be validated by backend
    gameFormat: game.gameFormat as any, // Will be validated by backend
    createdAt: new Date(game.createdAt),
    teams: game.teams.map(team => ({
      name: team.name,
      score: team.score,
      players: team.players.map(player => ({
        publicId: player.publicId,
        name: player.name,
        isActive: player.isActive,
      })),
    })),
    currentRound: game.currentRound ? {
      roundNumber: game.currentRound.roundNumber,
      status: game.currentRound.status as any, // Will be validated by backend
      cards: game.currentRound.cards.map(card => ({
        word: card.word,
        selected: card.selected,
        teamName: card.teamName,
        cardType: card.cardType,
      })),
      turns: game.currentRound.turns.map(turn => ({
        id: turn.id,
        teamName: turn.teamName,
        status: turn.status,
        guessesRemaining: turn.guessesRemaining,
        clue: turn.clue,
        guesses: turn.guesses,
      })),
    } : null,
    playerContext: {
      playerName: game.playerContext.playerName,
      teamName: game.playerContext.teamName,
      role: game.playerContext.role as any, // Will be validated by backend
    },
  };
}

const fetchGame = async (gameId: string, playerId: string): Promise<GameData> => {
  const response: AxiosResponse<GameStateApiResponse> = await api.get(
    `/games/${gameId}`,
    {
      params: { playerId }
    }
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch game data");
  }

  return transformApiResponseToGameData(response.data);
};

/**
 * Fetches and caches game state data.
 */
export const useGameDataQuery = (
  gameId: string | null,
): UseQueryResult<GameData, Error> => {
  const { currentPlayerId } = usePlayerContext();
  
  return useQuery<GameData>({
    queryKey: ["gameData", gameId, currentPlayerId],
    queryFn: () => {
      if (!gameId || !currentPlayerId) {
        throw new Error("Game ID and Player ID are required");
      }
      return fetchGame(gameId, currentPlayerId);
    },
    enabled: !!gameId && !!currentPlayerId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};