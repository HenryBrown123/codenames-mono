import { useState } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

/**
 * Turn data types for the turn state system
 */

export interface TurnGuess {
  cardWord: string;
  playerName: string;
  outcome: string;
  createdAt: Date;
}

export interface TurnClue {
  word: string;
  number: number;
  createdAt: Date;
}

export interface TurnData {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: Date;
  completedAt?: Date | null;
  clue?: TurnClue;
  hasGuesses: boolean;
  lastGuess?: TurnGuess;
  prevGuesses: TurnGuess[];
}

export interface GetTurnResponse {
  success: true;
  data: {
    turn: TurnData;
  };
}

/**
 * Fetches turn data from the backend API
 * GET /turns/{publicId}
 */
const fetchTurn = async (publicId: string): Promise<TurnData> => {
  const response: AxiosResponse<GetTurnResponse> = await api.get(
    `/turns/${publicId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch turn data");
  }

  return response.data.data.turn;
};

/**
 * Query hook for fetching turn data
 * @param publicId - The turn public ID to fetch, can be null
 * @returns React Query result with TurnData
 */
export const useTurnDataQuery = (
  publicId: string | null,
): UseQueryResult<TurnData, Error> => {
  return useQuery<TurnData>({
    queryKey: ["turn", publicId],
    queryFn: () => {
      if (!publicId) {
        throw new Error("Turn public ID is required");
      }
      return fetchTurn(publicId);
    },
    enabled: !!publicId,
    staleTime: 1000 * 60 * 5, // 5 minutes - turn data is relatively stable
    retry: 2,
  });
};
