import React, { useState } from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { usePlayersQuery } from "../game-data/queries";
import { FaLeaf } from "react-icons/fa";
import styles from "./device-handoff-overlay.module.css";

/**
 * Overlay prompting device handoff between players
 */

const getTeamSymbol = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "★";
  if (team.includes("blue")) return "♦";
  if (team.includes("green")) return <FaLeaf />;
  return "●";
};

const getTeamColor = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "var(--color-team-red, #ff0040)";
  if (team.includes("blue")) return "var(--color-team-blue, #00d4ff)";
  if (team.includes("green")) return "var(--color-primary, #00ff88)";
  return "var(--color-neutral, #888888)";
};

export interface DeviceHandoffOverlayViewProps {
  isExiting: boolean;
  displayName: string;
  teamColor: string;
  targetRole: PlayerRole;
  targetTeam: string;
  isReady: boolean;
  onContinue: () => void;
  onAnimationEnd: () => void;
}

export const DeviceHandoffOverlayView: React.FC<DeviceHandoffOverlayViewProps> = ({
  isExiting,
  displayName,
  teamColor,
  targetRole,
  targetTeam,
  isReady,
  onContinue,
  onAnimationEnd,
}) => (
  <div
    className={styles.overlayContainer}
    data-exiting={isExiting}
    onAnimationEnd={onAnimationEnd}
  >
    <div className={styles.backgroundBlur} />
    <div className={styles.handoffCard}>
      <h1 className={styles.title}>DEVICE HANDOFF</h1>

      <div
        className={styles.playerInfo}
        style={{ "--team-color": teamColor } as React.CSSProperties}
      >
        <div className={styles.playerName}>{displayName}</div>
        {targetRole === PLAYER_ROLE.CODEMASTER && (
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
        onClick={onContinue}
        disabled={!isReady}
      >
        {isReady ? "EXECUTE" : "LOADING..."}
      </button>
    </div>
  </div>
);

interface DeviceHandoffOverlayProps {
  gameData: GameData;
  onContinue: (playerId: string) => void;
}

export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: players } = usePlayersQuery(gameData.publicId);

  const nextPlayer = players?.find((p) => p.status === "ACTIVE");
  const isReady = !!nextPlayer;
  const targetRole = nextPlayer?.role || PLAYER_ROLE.NONE;
  const targetTeam = nextPlayer?.teamName || "Team";
  const teamColor = getTeamColor(targetTeam);
  const displayName = nextPlayer
    ? targetRole === PLAYER_ROLE.CODEMASTER
      ? nextPlayer.name
      : `${targetTeam} Operatives`
    : "LOADING...";

  const handleContinueClick = () => {
    if (nextPlayer) {
      setSelectedPlayerId(nextPlayer.publicId);
      setIsExiting(true);
    }
  };

  const handleAnimationEnd = () => {
    if (isExiting && selectedPlayerId) {
      onContinue(selectedPlayerId);
    }
  };

  return (
    <DeviceHandoffOverlayView
      isExiting={isExiting}
      displayName={displayName}
      teamColor={teamColor}
      targetRole={targetRole}
      targetTeam={targetTeam}
      isReady={isReady}
      onContinue={handleContinueClick}
      onAnimationEnd={handleAnimationEnd}
    />
  );
};
