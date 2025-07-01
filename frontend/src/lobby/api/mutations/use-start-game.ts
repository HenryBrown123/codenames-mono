import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface StartGameApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      status: string;
    };
  };
}

export interface GameStartedResult {
  publicId: string;
  status: string;
}

const startGameApi = async (gameId: string): Promise<GameStartedResult> => {
  const response: AxiosResponse<StartGameApiResponse> = await api.post(
    `/games/${gameId}/start`,
  );

  if (!response.data.success) {
    throw new Error("Failed to start game");
  }

  return response.data.data.game;
};

export const useStartGame = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startGameApi(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};