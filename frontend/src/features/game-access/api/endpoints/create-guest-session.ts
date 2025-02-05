import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

// Creates a session and guest user
interface CreateGuestSessionResponse extends Response {
  success: boolean;
}

export const createGuestSession =
  async (): Promise<CreateGuestSessionResponse> => {
    const response: AxiosResponse<CreateGuestSessionResponse> =
      await api.post("/auth/guest");
    if (!response.data.success) {
      console.error("Failed to create a new session", response.data);
    }
    console.log("Session created!");
    return response.data;
  };
