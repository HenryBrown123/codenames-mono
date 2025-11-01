import React, { useState } from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { usePlayersQuery } from "../game-data/queries";
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
 * Device handoff overlay - queries players to determine next player
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: players } = usePlayersQuery(gameData.publicId);

  const nextPlayer = players?.find((p) => p.status === "ACTIVE");
  const isReady = !!nextPlayer;

  const handleContinueClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsExiting(true);
  };

  const handleAnimationEnd = () => {
    if (isExiting && selectedPlayerId) {
      onContinue(selectedPlayerId);
    }
  };

  const targetRole = nextPlayer?.role || PLAYER_ROLE.NONE;
  const targetTeam = nextPlayer?.teamName || "Team";
  const teamColor = getTeamColor(targetTeam);

  const displayName = nextPlayer
    ? targetRole === PLAYER_ROLE.CODEMASTER
      ? nextPlayer.name
      : `${targetTeam} Operatives`
    : "LOADING...";

  return (
    <div 
      className={styles.overlayContainer} 
      data-exiting={isExiting}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.backgroundBlur} />
      <div className={styles.handoffCard}>
        <h1 className={styles.title}>DEVICE HANDOFF</h1>

        <div
          className={styles.playerInfo}
          style={{
            '--team-color': teamColor,
          } as React.CSSProperties}
        >
          <div className={styles.playerName}>{displayName}</div>
          {targetRole === PLAYER_ROLE.CODEMASTER && nextPlayer && (
            <div className={styles.roleLabel}>
              {getTeamSymbol(targetTeam)} {targetTeam} Spymaster
            </div>
          )}
          {targetRole === PLAYER_ROLE.CODEBREAKER && (
            <div className={styles.roleLabel}>
              {getTeamSymbol(targetTeam)} {targetTeam}
            </div>
          )}
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
