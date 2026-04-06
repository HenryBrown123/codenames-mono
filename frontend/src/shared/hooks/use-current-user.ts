import { useQuery } from "@tanstack/react-query";
import api from "@frontend/shared/api/api";

export interface CurrentUser {
  userId: number;
  username: string;
  createdAt: string;
}

interface GetCurrentUserResponse {
  success: boolean;
  data: CurrentUser;
}

const fetchCurrentUser = async (): Promise<CurrentUser> => {
  /** Get username from localStorage (stored during guest login) */
  const username = localStorage.getItem("username");

  if (!username) {
    throw new Error("No username found - user not authenticated");
  }

  const response = await api.get<GetCurrentUserResponse>(`/users/${encodeURIComponent(username)}`);

  if (!response.data.success) {
    throw new Error("Failed to get current user");
  }

  return response.data.data;
};

/**
 * Hook to get the current authenticated user's information
 */
export const useCurrentUser = () => {
  return useQuery<CurrentUser, Error>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: Infinity, // User info doesn't change during session
    retry: false, // Don't retry on 401 (will redirect to /auth/guest)
  });
};
