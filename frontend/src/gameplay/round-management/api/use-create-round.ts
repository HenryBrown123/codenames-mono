import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { usePlayerContext } from "../../shared/providers/player-context-provider";

interface CreateRoundApiResponse {
  success: boolean;
  data: {
    round: {
      roundNumber: number;
      status: string;
    };
  };
}

/**
 * Creates a new round for the game.
 */
export const useCreateRoundMutation = (
  gameId: string,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const { currentPlayerId } = usePlayerContext();

  return useMutation({
    mutationFn: async () => {
      const response: AxiosResponse<CreateRoundApiResponse> = await api.post(
        `/games/${gameId}/rounds`,
        { playerId: currentPlayerId}
      );

      if (!response.data.success) {
        throw new Error("Failed to create round");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
