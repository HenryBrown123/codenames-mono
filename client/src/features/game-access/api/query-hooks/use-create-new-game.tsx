import { useMutation } from "@tanstack/react-query";
import { Settings } from "@shared-types/game-types";
import { createNewGame } from "../create-new-game";

// Hook for creating a new game
export const useCreateNewGame = () => {
  return useMutation({
    mutationKey: ["createNewGame"],
    mutationFn: (payload?: Settings) => createNewGame(payload),
  });
};
