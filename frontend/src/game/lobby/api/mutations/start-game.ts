import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

interface StartGameApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      status: string;
    };
  };
}

/** Result returned by {@link useStartGameMutation}. */
export interface GameStartedResult {
  publicId: string;
  status: string;
}

const startGameApi = async (gameId: string): Promise<GameStartedResult> => {
  const response: AxiosResponse<StartGameApiResponse> = await api.post(`/games/${gameId}/start`);

  if (!response.data.success) {
    throw new Error("Failed to start game");
  }

  return response.data.data.game;
};

/**
 * Mutation that flips a lobby into an active game. Invalidates both
 * the lobby and game-data queries on success so the page can
 * navigate to gameplay with the new state already populated.
 */
export const useStartGameMutation = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startGameApi(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
