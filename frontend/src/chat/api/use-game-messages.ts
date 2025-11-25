import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

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
      const response: AxiosResponse<GameMessagesApiResponse> = await api.get(
        `/games/${gameId}/messages`,
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch game messages");
      }

      return response.data.data.messages;
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};
