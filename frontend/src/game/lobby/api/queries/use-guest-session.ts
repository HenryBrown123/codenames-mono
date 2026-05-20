import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createGuestSession, SessionCreatedResult } from "../endpoints/create-guest-session";

/**
 * Mutation that creates a guest session for anonymous gameplay.
 *
 * Side effect: stashes the resulting username in `localStorage`
 * under `"username"` so the multi-device handoff can recognise the
 * same guest across page refreshes.
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
