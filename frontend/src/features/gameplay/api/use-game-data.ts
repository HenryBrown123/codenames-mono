import {
  useQuery,
  UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GameData,
  GameState,
  Settings,
} from "@frontend/shared-types/game-types";
import fetchGame from "./fetch-game";
import submitTurn from "./submit-turn";

export const useGameData = (
  gameId: string | null,
): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["gameData", gameId],
    queryFn: () =>
      gameId ? fetchGame(gameId) : Promise.reject("Game ID is required"), // Fetch from server
  });
};

// Hook for processing a turn
export const useProcessTurn = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (
    updatedGameState: GameState,
    variables: { gameId: string; gameState: GameState },
  ) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["processTurn"],
    mutationFn: ({
      gameId,
      gameState,
    }: {
      gameId: string;
      gameState: GameState;
    }) => submitTurn(gameId, gameState),
    onSuccess: (updatedGameState, { gameId, gameState }) => {
      queryClient.setQueryData(["gameData", gameId], (oldData: GameData) => ({
        ...oldData,
        state: updatedGameState,
      }));

      if (onSuccess) {
        onSuccess(updatedGameState, { gameId, gameState });
      }
    },
    onError: (error) => {
      console.error("Error submitting turn:", error);
      if (onError) {
        onError(error);
      }
    },
  });
};
