import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import {
  TurnData,
  GetTurnResponse,
  transformApiTurnResponse
} from "@frontend/shared-types";

/**
 * Fetches turn data from the backend API
 * GET /turns/{publicId}
 */
const fetchTurn = async (turnId: string): Promise<TurnData> => {
  const response: AxiosResponse<GetTurnResponse> = await api.get(
    `/turns/${turnId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch turn data");
  }

  const apiTurn = response.data.data.turn;
  return transformApiTurnResponse(apiTurn);
};

/**
 * Query hook for fetching turn data
 * @param turnId - The turn ID to fetch, can be null
 * @returns React Query result with TurnData
 */
export const useTurnDataQuery = (
  turnId: string | null,
): UseQueryResult<TurnData, Error> => {
  return useQuery<TurnData>({
    queryKey: ["turn", turnId],
    queryFn: async () => {
      if (!turnId) {
        throw new Error("Turn ID is required");
      }
      return await fetchTurn(turnId);
    },
    enabled: !!turnId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
