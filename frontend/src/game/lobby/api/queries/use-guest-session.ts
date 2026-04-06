import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createGuestSession, SessionCreatedResult } from "../endpoints/create-guest-session";

/**
 * Creates a guest session for anonymous gameplay.
 */
export const useCreateGuestSession = (): UseMutationResult<SessionCreatedResult, Error, void> => {
  return useMutation({
    mutationKey: ["createGuestSession"],
    mutationFn: async () => {
      const result = await createGuestSession();

      /** Store username in localStorage for multi-device features */
      localStorage.setItem("username", result.user.username);

      return result;
    },
  });
};
