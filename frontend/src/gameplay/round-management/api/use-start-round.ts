import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";
import { useGameDataRequired } from "../../game-data/providers";

interface StartRoundApiResponse {
  success: boolean;
  data: {
    round: {
      roundNumber: number;
      status: string;
    };
  };
}

interface StartRoundInput {
  roundNumber: number;
}

/**
 * Starts an existing round.
 */
export const useStartRoundMutation = (
  gameId: string,
): UseMutationResult<void, Error, StartRoundInput> => {
  const queryClient = useQueryClient();
  const { gameData } = useGameDataRequired();


  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const response: AxiosResponse<StartRoundApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/start`,
        { playerId: gameData.playerContext?.publicId ?? null }
      );

      if (!response.data.success) {
        throw new Error("Failed to start round");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
