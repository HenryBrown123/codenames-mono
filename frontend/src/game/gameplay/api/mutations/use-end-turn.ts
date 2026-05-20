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
 * Mutation that ends the active turn.
 *
 * Sends the viewer's `role` in single-device mode (so the server can
 * resolve which seated player is acting) and their `playerId` in
 * multi-device mode. Invalidates the game-data and `turn` queries on
 * success so the next turn surfaces immediately.
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
