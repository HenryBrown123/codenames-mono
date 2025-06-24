import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

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

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const response: AxiosResponse<StartRoundApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/start`,
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
