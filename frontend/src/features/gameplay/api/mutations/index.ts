/**
 * Mutation Hooks
 *
 * All mutation hooks follow the naming pattern use[Action]Mutation
 * Each mutation automatically invalidates the gameData query on success
 */

export { useGiveClueMutation } from "./use-give-clue-mutation";
export { useMakeGuessMutation } from "./use-make-guess-mutation";
export { useCreateRoundMutation } from "./use-create-round-mutation";
export { useStartRoundMutation } from "./use-start-round-mutation";
export { useDealCardsMutation } from "./use-deal-cards-mutation";
export { useEndTurnMutation } from "./use-end-turn-mutation";
