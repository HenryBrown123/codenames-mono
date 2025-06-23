import { useMutation } from "@tanstack/react-query";
import { createNewGame, CreateGamePayload } from "../endpoints/create-new-game";

// Hook for creating a new game
export const useCreateNewGame = () => {
  return useMutation({
    mutationKey: ["createNewGame"],
    mutationFn: (payload: CreateGamePayload) => createNewGame(payload),
  });
};
