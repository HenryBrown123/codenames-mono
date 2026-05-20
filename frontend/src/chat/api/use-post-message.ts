import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { GameMessage } from "./use-game-messages";

interface PostMessageInput {
  content: string;
  teamOnly: boolean;
}

interface PostMessageApiResponse {
  success: boolean;
  data: {
    message: GameMessage;
  };
}

/**
 * Mutation that posts a chat message to the game log.
 *
 * On success, invalidates the message-list query so the new entry
 * appears without waiting for the 5s poll interval.
 */
export const usePostMessage = (
  gameId: string,
): UseMutationResult<GameMessage, Error, PostMessageInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PostMessageInput) => {
      const response: AxiosResponse<PostMessageApiResponse> = await api.post(
        `/games/${gameId}/messages`,
        {
          content: input.content,
          teamOnly: input.teamOnly,
        },
      );

      if (!response.data.success) {
        throw new Error("Failed to post message");
      }

      return response.data.data.message;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["game", gameId, "messages"] });
    },
  });
};
