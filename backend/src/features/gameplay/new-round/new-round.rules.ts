import {
  GAME_STATE,
  ROUND_STATE,
  MAX_ROUNDS_BY_FORMAT,
} from "@codenames/shared/types";
import { gameplayBaseSchema } from "../state/gameplay-state.types";

/**
 * Game rules that must be satisfied for new round creation.
 */
export const roundCreationAllowedSchema = gameplayBaseSchema
  // Game must be in progress
  .refine(
    (game) => {
      return game.status === GAME_STATE.IN_PROGRESS;
    },
    {
      message: "Game must be in progress to create a round",
      path: ["status"],
    },
  )
  // Latest round must be completed (if it exists)
  .refine(
    (game) => {
      if (!game.rounds || game.rounds.length === 0) return true;
      const latestRound = game.rounds[game.rounds.length - 1];
      return latestRound.status === ROUND_STATE.COMPLETED;
    },
    {
      message: "Previous round must be completed before creating a new round",
      path: ["rounds"],
    },
  )
  // Maximum rounds not reached
  .refine(
    (game) => {
      if (!game.rounds || game.rounds.length === 0) return true;
      return game.rounds.length < MAX_ROUNDS_BY_FORMAT[game.game_format];
    },
    (game) => {
      return {
        message: `Maximum of ${MAX_ROUNDS_BY_FORMAT[game.game_format]} rounds allowed for ${game.game_format} format`,
        path: ["rounds"],
      };
    },
  );
