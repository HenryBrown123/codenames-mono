import { useMutation } from "@tanstack/react-query";
import { createGuestSession } from "../endpoints/create-guest-session";

// Hook for creating a new game
export const useCreateGuestSession = () => {
  return useMutation({
    mutationKey: ["createGuestSession"],
    mutationFn: () => createGuestSession(),
  });
};
