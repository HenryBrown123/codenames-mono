import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";
import { LobbyAggregate } from "../state/lobby-state.types";
import { 
  LobbyValidationResult, 
  ValidatedLobbyState,
  createBrandedResult 
} from "../state/lobby-state.validation";

/**
 * Rules for validating card dealing in the lobby context
 */
const cardDealingRules = {
  hasCurrentRound(lobby: LobbyAggregate): boolean {
    return lobby.currentRound !== null && lobby.currentRound !== undefined;
  },

  isRoundInSetupState(lobby: LobbyAggregate): boolean {
    return lobby.currentRound?.status === ROUND_STATE.SETUP;
  },

  hasNoCardsDealt(lobby: LobbyAggregate): boolean {
    return !lobby.currentRound?.cards || lobby.currentRound.cards.length === 0;
  },

  hasMinimumTwoTeams(lobby: LobbyAggregate): boolean {
    return lobby.teams.length >= 2;
  },
};

/**
 * Type for a validated lobby state during card dealing
 */
export type DealCardsValidLobbyState = ValidatedLobbyState<"dealCards"> & {
  currentRound: NonNullable<LobbyAggregate['currentRound']>;
};

/**
 * Validates if cards can be dealt
 */
export function validate(
  lobby: LobbyAggregate
): LobbyValidationResult<DealCardsValidLobbyState> {
  const errors: Array<{ path?: string[]; message: string }> = [];

  if (!cardDealingRules.hasCurrentRound(lobby)) {
    errors.push({
      path: ["currentRound"],
      message: "No current round to deal cards to",
    });
  }

  if (!cardDealingRules.isRoundInSetupState(lobby)) {
    errors.push({
      path: ["currentRound", "status"],
      message: `Round must be in SETUP state, current: ${lobby.currentRound?.status}`,
    });
  }

  if (!cardDealingRules.hasNoCardsDealt(lobby)) {
    errors.push({
      path: ["currentRound", "cards"],
      message: "Cards have already been dealt for this round",
    });
  }

  if (!cardDealingRules.hasMinimumTwoTeams(lobby)) {
    errors.push({
      path: ["teams"],
      message: "Game must have at least 2 teams to deal cards",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: createBrandedResult(lobby, "dealCards") as DealCardsValidLobbyState };
}