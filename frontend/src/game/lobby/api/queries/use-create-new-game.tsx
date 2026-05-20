import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { createNewGame, GameCreatedResult } from "../endpoints/create-new-game";
import type { GameType, GameFormat } from "@frontend/shared/types";

interface CreateGameInput {
  gameType: GameType;
  gameFormat: GameFormat;
  aiMode: boolean;
}

/**
 * Mutation that creates a new game and resolves to its public id +
 * domain-shaped metadata. Pure wrapper around {@link createNewGame}
 * — no cache invalidation, since the caller routes to the new game.
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
