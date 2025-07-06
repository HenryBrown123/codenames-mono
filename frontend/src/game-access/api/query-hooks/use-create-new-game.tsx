import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createNewGame, GameCreatedResult } from "../endpoints/create-new-game";
import { GameType, GameFormat } from "@frontend/shared-types/domain-types";

interface CreateGameInput {
  gameType: GameType;
  gameFormat: GameFormat;
}

/**
 * Creates a new game with the specified type and format.
 */
export const useCreateNewGame = (): UseMutationResult<
  GameCreatedResult,
  Error,
  CreateGameInput
> => {
  return useMutation({
    mutationKey: ["createNewGame"],
    mutationFn: (payload: CreateGameInput) => createNewGame(payload),
  });
};
