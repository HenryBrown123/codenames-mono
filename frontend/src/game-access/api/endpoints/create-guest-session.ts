import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface CreateGuestSessionApiResponse {
  success: boolean;
  data: {
    user: {
      username: string;
    };
    session: {
      username: string;
      token: string;
    };
  };
}

export interface SessionCreatedResult {
  user: {
    username: string;
  };
  session: {
    username: string;
    token: string;
  };
}

export const createGuestSession = async (): Promise<SessionCreatedResult> => {
  const response: AxiosResponse<CreateGuestSessionApiResponse> = await api.post("/auth/guests");
  
  if (!response.data.success) {
    throw new Error("Failed to create guest session");
  }
  
  return response.data.data;
};
