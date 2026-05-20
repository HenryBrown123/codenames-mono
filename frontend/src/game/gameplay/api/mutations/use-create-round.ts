import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { useGameDataRequired } from "../../providers";

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
 * Mutation that creates the next round in the game.
 *
 * Sends the viewer's `playerContext.publicId` so the server can run
 * permission checks. Invalidates the game-data query on success so the
 * new round appears without waiting for the next refetch.
 */
export const useCreateRoundMutation = (
  gameId: string,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const { gameData } = useGameDataRequired();

  return useMutation({
    mutationFn: async () => {
      const response: AxiosResponse<CreateRoundApiResponse> = await api.post(
        `/games/${gameId}/rounds`,
        { playerId: gameData.playerContext?.publicId ?? null }
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
