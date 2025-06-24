/**
 * Mutation Hooks
 *
 * All mutation hooks follow the naming pattern use[Action]Mutation
 * Each mutation automatically invalidates the gameData query on success
 */

export { useGiveClueMutation } from "./use-give-clue";
export { useMakeGuessMutation } from "./use-make-guess";
export { useCreateRoundMutation } from "./use-create-round";
export { useStartRoundMutation } from "./use-start-round";
export { useDealCardsMutation } from "./use-deal-cards";
export { useEndTurnMutation } from "./use-end-turn";
