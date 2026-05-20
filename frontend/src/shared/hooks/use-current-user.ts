import { useQuery } from "@tanstack/react-query";
import api from "@frontend/shared/api/api";

/** Server-shaped profile for the authenticated viewer. */
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
 * Loads the authenticated user's profile.
 *
 * Looks up the username from `localStorage` (stamped on by the
 * guest-session mutation) and fetches the matching record. Cached
 * for the lifetime of the session — `staleTime: Infinity`, no retry
 * (a 401 is handled globally by the api interceptor).
 */
export const useCurrentUser = () => {
  return useQuery<CurrentUser, Error>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: Infinity, // User info doesn't change during session
    retry: false, // Don't retry on 401 (will redirect to /auth/guest)
  });
};
