import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { useGameDataRequired } from "../../providers";

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
 * Mutation that transitions an existing round from `SETUP` to `IN_PROGRESS`.
 *
 * Sends the viewer's `playerContext.publicId` for permission checks.
 * Invalidates the game-data query on success so the new round status
 * and first turn surface immediately.
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
