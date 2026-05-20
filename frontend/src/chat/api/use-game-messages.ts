import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

/**
 * A single entry in the game chat log — a chat line, AI-thinking
 * narration or a system notice. Server filters team-only entries the
 * caller isn't entitled to see.
 */
export interface GameMessage {
  id: string;
  gameId: string;
  /** Player public ID (UUID). Null for SYSTEM/AI_THINKING messages. */
  playerId: string | null;
  playerName: string | null;
  teamName: string | null;
  teamOnly: boolean;
  messageType: "CHAT" | "AI_THINKING" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface GameMessagesApiResponse {
  success: boolean;
  data: {
    messages: GameMessage[];
  };
}

/**
 * Polls the game-message log every 5 seconds.
 *
 * Server filters team-only messages by the authenticated player's
 * team. Swallows network errors into an empty array so the chat panel
 * never falls into an undefined state mid-poll.
 */
export const useGameMessages = (gameId: string): UseQueryResult<GameMessage[], Error> => {
  return useQuery({
    queryKey: ["game", gameId, "messages"],
    refetchInterval: 5000,
    queryFn: async () => {
      try {
        const response: AxiosResponse<GameMessagesApiResponse> = await api.get(
          `/games/${gameId}/messages?limit=1000`,
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch game messages");
        }

        return response.data.data.messages || [];
      } catch (error) {
        // Empty array so consumers never see `undefined` mid-poll.
        console.error("Error fetching game messages:", error);
        return [];
      }
    },
  });
};
