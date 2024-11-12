import {
  useQuery,
  UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { GameData, GameState, Settings } from "@game/game-common-types";
import apis from "src/api";

// Use this hook to fetch server-synced game data
export const useGameData = (
  gameId: string | null
): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["gameData", gameId],
    queryFn: () =>
      gameId ? apis.fetchGame(gameId) : Promise.reject("Game ID is required"), // Fetch from server
  });
};

// Hook for creating a new game
export const useCreateNewGame = () => {
  return useMutation({
    mutationKey: ["createNewGame"],
    mutationFn: (payload?: Settings) => apis.createNewGame(payload),
  });
};

// Hook for processing a turn
export const useProcessTurn = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (updatedGameState: GameState) => void;
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
    }) => apis.submitTurn(gameId, gameState),
    onSuccess: (updatedGameState, { gameId }) => {
      queryClient.setQueryData(["gameData", gameId], (oldData: GameData) => ({
        ...oldData,
        state: updatedGameState,
      }));

      // Custom onSuccess handler if provided
      if (onSuccess) {
        onSuccess(updatedGameState);
      }
    },
    onError: (error) => {
      console.error("Error submitting turn:", error);
      // Custom onError handler if provided
      if (onError) {
        onError(error);
      }
    },
  });
};
