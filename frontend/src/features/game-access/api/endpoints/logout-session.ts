import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface LogoutSessionResponse extends Response {
  success: boolean;
}

export const logoutSession = async (): Promise<LogoutSessionResponse> => {
  const response: AxiosResponse<LogoutSessionResponse> =
    await api.post("/auth/logout");
  if (!response.data.success) {
    console.error("Failed to log out", response.data);
  }
  return response.data;
};
