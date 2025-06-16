import { useMemo } from "react";
import { PlayerRole, PLAYER_ROLE, GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";

export interface HandoffData {
  targetPlayer: string;
  targetRole: PlayerRole;
  targetTeam: string;
  currentRound?: number;
  actionNeeded: string;
}

export interface DeviceHandoffHook {
  needsHandoff: boolean;
  handoffData: HandoffData | null;
}

/**
 * Hook to determine when device handoff is needed in single device mode
 * Fixed to check whose turn it is to act, not just what role the user has
 */
export const useDeviceHandoff = (
  gameData?: GameData,
  currentUIRole?: PlayerRole,
): DeviceHandoffHook => {
  const needsHandoff = useMemo(() => {
    // Only applicable to single device games
    if (gameData?.gameType !== GAME_TYPE.SINGLE_DEVICE) {
      return false;
    }

    // Must have basic game data
    if (!gameData?.currentRound || !gameData?.playerContext?.playerName) {
      return false;
    }

    // Find the active turn to determine whose turn it is
    const activeTurn = gameData.currentRound.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    if (!activeTurn) {
      return false;
    }

    // Only care about handoffs when it's this player's team's turn
    if (activeTurn.teamName !== gameData.playerContext.teamName) {
      return false;
    }

    // Determine what role should be active for this turn
    const activeRole = activeTurn.clue
      ? PLAYER_ROLE.CODEBREAKER
      : PLAYER_ROLE.CODEMASTER;

    // Need handoff if the role that should be acting differs from current UI role
    return activeRole !== currentUIRole;
  }, [
    gameData?.gameType,
    gameData?.currentRound,
    gameData?.playerContext?.teamName,
    gameData?.playerContext?.playerName,
    currentUIRole,
  ]);

  const handoffData = useMemo((): HandoffData | null => {
    if (!needsHandoff || !gameData?.currentRound || !gameData?.playerContext) {
      return null;
    }

    // Get the active turn and determine role
    const activeTurn = gameData.currentRound.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    if (!activeTurn) return null;

    const targetRole = activeTurn.clue
      ? PLAYER_ROLE.CODEBREAKER
      : PLAYER_ROLE.CODEMASTER;

    // Determine what action is needed based on role and turn state
    const getActionNeeded = (role: PlayerRole, hasClue: boolean): string => {
      switch (role) {
        case PLAYER_ROLE.CODEMASTER:
          return "give a clue to your team";
        case PLAYER_ROLE.CODEBREAKER:
          return hasClue
            ? `make guesses based on the clue "${activeTurn.clue?.word}"`
            : "wait for your codemaster's clue";
        case PLAYER_ROLE.SPECTATOR:
          return "watch the game";
        default:
          return "continue playing";
      }
    };

    // For single device, we show generic "player" name based on role + team
    const getPlayerName = (role: PlayerRole, teamName: string): string => {
      return `${teamName} ${role.charAt(0) + role.slice(1).toLowerCase()}`;
    };

    return {
      targetPlayer: getPlayerName(targetRole, gameData.playerContext.teamName),
      targetRole: targetRole,
      targetTeam: gameData.playerContext.teamName,
      currentRound: gameData.currentRound.roundNumber,
      actionNeeded: getActionNeeded(targetRole, !!activeTurn.clue),
    };
  }, [needsHandoff, gameData]);

  return { needsHandoff, handoffData };
};
