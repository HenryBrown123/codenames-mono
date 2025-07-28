import React, { useState } from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { usePlayersQuery } from "../shared/api";
import { FaLeaf } from "react-icons/fa";
import styles from "./device-handoff-overlay.module.css";


interface DeviceHandoffOverlayProps {
  gameData: GameData;
  onContinue: (playerId: string) => void;
}

/**
 * Gets team symbol using the same symbols as game cards
 */
const getTeamSymbol = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "★";
  if (team.includes("blue")) return "♦";
  if (team.includes("green")) return <FaLeaf />;
  return "●";
};

/**
 * Gets role symbol
 */
const getRoleSymbol = (role: string) => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return "⚡";
    case PLAYER_ROLE.CODEBREAKER:
      return "🔍";
    case PLAYER_ROLE.SPECTATOR:
      return "👁";
    default:
      return "◆";
  }
};

/**
 * Gets team color using design system colors
 */
const getTeamColor = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "var(--color-team-red, #ff0040)";
  if (team.includes("blue")) return "var(--color-team-blue, #00d4ff)";
  if (team.includes("green")) return "var(--color-primary, #00ff88)";
  return "var(--color-neutral, #888888)";
};

/**
 * Gets action text based on role - hacker themed
 */
const getActionText = (role: PlayerRole): string => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return ">>> CLASSIFIED DATA INCOMING\n>>> HIDE SCREEN FROM OPERATIVES\n>>> INTEL COMPROMISED IF SEEN";
    case PLAYER_ROLE.CODEBREAKER:
      return ">>> DECODE TRANSMISSION\n>>> ANALYZE OPERATIVE INTEL\n>>> LOCATE TARGET ASSETS";
    case PLAYER_ROLE.SPECTATOR:
      return ">>> SURVEILLANCE MODE ACTIVE\n>>> MONITOR FIELD OPERATIONS";
    default:
      return ">>> CONTINUE MISSION";
  }
};

/**
 * Device handoff overlay - queries players to determine next player
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Query players to find who's active
  const { data: players } = usePlayersQuery(gameData.publicId);

  // Find the next active player - if no data yet, we'll show loading state
  const nextPlayer = players?.find((p) => p.status === "ACTIVE");
  const isReady = !!nextPlayer;

  // Handle continue click
  const handleContinueClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsExiting(true);
  };

  // Handle animation end
  const handleAnimationEnd = () => {
    if (isExiting && selectedPlayerId) {
      onContinue(selectedPlayerId);
    }
  };

  // Determine display values - use placeholders if still loading
  const targetRole = nextPlayer?.role || PLAYER_ROLE.NONE;
  const targetTeam = nextPlayer?.teamName || "Team";
  const teamColor = getTeamColor(targetTeam);

  // Display name based on role
  const displayName = nextPlayer
    ? targetRole === PLAYER_ROLE.CODEMASTER
      ? nextPlayer.name
      : `${targetTeam} Operatives`
    : "LOADING...";

  const actionText = getActionText(targetRole);

  return (
    <div 
      className={styles.overlayContainer} 
      data-exiting={isExiting}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.backgroundBlur} />
      <div className={styles.handoffCard}>
        <div 
          className={styles.handoffIcon}
          style={{
            '--team-color': teamColor,
            '--team-color-start': `${teamColor}dd`,
            '--team-color-end': `${teamColor}99`
          } as React.CSSProperties}
        >
          {targetRole === PLAYER_ROLE.CODEMASTER ? getRoleSymbol(targetRole) : getTeamSymbol(targetTeam)}
        </div>

        <h1 className={styles.title}>Device Handoff</h1>
        <p className={styles.subtitle}>
          {isReady
            ? ">>> TRANSFERRING CONTROL"
            : ">>> ESTABLISHING CONNECTION..."}
        </p>

        <div className={styles.playerInfo} style={{ opacity: isReady ? 1 : 0.5 }}>
          <h2 
            className={styles.playerName}
            data-team={targetRole === PLAYER_ROLE.CODEBREAKER ? "true" : undefined}
            style={targetRole === PLAYER_ROLE.CODEBREAKER ? {
              '--team-color': teamColor,
              '--team-color-start': `${teamColor}dd`,
              '--team-color-end': `${teamColor}99`
            } as React.CSSProperties : undefined}
          >
            {displayName}
          </h2>

          {targetRole === PLAYER_ROLE.CODEMASTER && nextPlayer && (
            <div 
              className={styles.teamInfo}
              style={{
                '--team-color': teamColor,
                '--team-color-start': `${teamColor}dd`,
                '--team-color-end': `${teamColor}99`
              } as React.CSSProperties}
            >
              {targetTeam} Spymaster
            </div>
          )}

          <p className={styles.actionText}>{actionText}</p>
        </div>

        <button
          className={styles.continueButton}
          onClick={() => nextPlayer && handleContinueClick(nextPlayer.publicId)}
          disabled={!isReady}
        >
          {isReady ? "EXECUTE" : "LOADING..."}
        </button>
      </div>
    </div>
  );
};