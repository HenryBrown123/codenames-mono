import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";
import { GAME_TYPE } from "@codenames/shared/types";
import { usePlayerSession } from "../../game-data/providers/active-game-session-provider";
import { useGameDataRequired } from "../../game-data/providers";

interface StartTurnApiResponse {
  success: boolean;
  data: {
    turn: {
      publicId: string;
      teamName: string;
      status: string;
      createdAt: string;
    };
  };
}

interface StartTurnInput {
  roundNumber: number;
}

/**
 * Creates a new turn for the next team.
 * Used when the previous turn has completed and a new turn needs to be started manually.
 */
export const useStartTurnMutation = (
  gameId: string,
): UseMutationResult<void, Error, StartTurnInput> => {
  const queryClient = useQueryClient();
  const { claimedRole } = usePlayerSession();
  const { gameData } = useGameDataRequired();

  const isSingleDevice = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const body = isSingleDevice
        ? { role: claimedRole }
        : { playerId: gameData.playerContext!.publicId };

      const response: AxiosResponse<StartTurnApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/turns`,
        body,
      );

      if (!response.data.success) {
        throw new Error("Failed to start turn");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      await queryClient.invalidateQueries({ queryKey: ["turn"] });
    },
  });
};
