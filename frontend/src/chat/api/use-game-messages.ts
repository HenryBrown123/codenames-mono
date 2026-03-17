import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";

export interface GameMessage {
  id: string;
  gameId: number;
  playerId: number | null;
  playerName: string | null;
  teamId: number | null;
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
 * Fetches game messages (chat, AI narration, system messages).
 * Automatically filters team-only messages based on player's team.
 */
export const useGameMessages = (gameId: string): UseQueryResult<GameMessage[], Error> => {
  return useQuery({
    queryKey: ["game", gameId, "messages"],
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
        console.error("Error fetching game messages:", error);
        return []; // Return empty array instead of undefined
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};
