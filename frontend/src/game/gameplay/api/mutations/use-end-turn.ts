import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { GAME_TYPE } from "@codenames/shared/types";
import { usePlayerSession } from "../../providers/active-game-session-provider";
import { useGameDataRequired } from "../../providers";

interface EndTurnApiResponse {
  success: boolean;
  data: {
    turn: {
      id: string;
      teamName: string;
      status: string;
      completedAt: string;
    };
  };
}

interface EndTurnInput {
  roundNumber: number;
}

/**
 * Ends the current turn.
 */
export const useEndTurnMutation = (
  gameId: string,
): UseMutationResult<void, Error, EndTurnInput> => {
  const queryClient = useQueryClient();
  const { claimedRole } = usePlayerSession();
  const { gameData } = useGameDataRequired();

  const isSingleDevice = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const body = isSingleDevice
        ? { role: claimedRole }
        : { playerId: gameData.playerContext!.publicId };

      const response: AxiosResponse<EndTurnApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/end-turn`,
        body,
      );

      if (!response.data.success) {
        throw new Error("Failed to end turn");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      await queryClient.invalidateQueries({ queryKey: ["turn"] });
    },
  });
};
