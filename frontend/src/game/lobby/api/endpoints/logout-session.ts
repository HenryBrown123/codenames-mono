import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

interface LogoutSessionResponse extends Response {
  success: boolean;
}

/**
 * Posts to the server logout endpoint. Never throws on failure —
 * just logs and returns the raw response so callers can still tear
 * down local state.
 */
export const logoutSession = async (): Promise<LogoutSessionResponse> => {
  const response: AxiosResponse<LogoutSessionResponse> =
    await api.post("/auth/logout");
  if (!response.data.success) {
    console.error("Failed to log out", response.data);
  }
  return response.data;
};
