import { GAME_STATE, ROUND_STATE, MAX_ROUNDS_BY_FORMAT } from "@codenames/shared/types";
import { LobbyAggregate } from "../state/lobby-state.types";
import { 
  LobbyValidationResult, 
  ValidatedLobbyState,
  createBrandedResult 
} from "../state/lobby-state.validation";

/**
 * Rules for validating round creation in the lobby context
 */
const roundCreationRules = {
  isPreviousRoundCompleted(lobby: LobbyAggregate): boolean {
    if (!lobby.currentRound) return true;
    return lobby.currentRound.status === ROUND_STATE.COMPLETED;
  },

  isWithinMaxRounds(lobby: LobbyAggregate): boolean {
    const completedRounds = lobby.historicalRounds?.length || 0;
    const maxRounds = MAX_ROUNDS_BY_FORMAT[lobby.game_format];
    return completedRounds < maxRounds;
  },

  isGameInProgress(lobby: LobbyAggregate): boolean {
    return lobby.status === GAME_STATE.IN_PROGRESS;
  },
};

/**
 * Type for a validated lobby state during round creation
 */
export type NewRoundValidLobbyState = ValidatedLobbyState<"newRound">;

/**
 * Validates if a new round can be created
 */
export function validate(
  lobby: LobbyAggregate
): LobbyValidationResult<NewRoundValidLobbyState> {
  const errors: Array<{ path?: string[]; message: string }> = [];

  if (!roundCreationRules.isGameInProgress(lobby)) {
    errors.push({
      path: ["status"],
      message: `Game must be in IN_PROGRESS state, current: ${lobby.status}`,
    });
  }

  if (!roundCreationRules.isPreviousRoundCompleted(lobby)) {
    errors.push({
      path: ["currentRound", "status"],
      message: "Current round must be completed before creating a new round",
    });
  }

  if (!roundCreationRules.isWithinMaxRounds(lobby)) {
    const maxRounds = MAX_ROUNDS_BY_FORMAT[lobby.game_format];
    errors.push({
      path: ["historicalRounds"],
      message: `Maximum of ${maxRounds} rounds allowed for ${lobby.game_format} format`,
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: createBrandedResult(lobby, "newRound") };
}