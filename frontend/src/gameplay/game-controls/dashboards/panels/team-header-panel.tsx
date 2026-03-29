import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useAiStatus } from "@frontend/ai/api";
import { AwaitingLabel } from "@frontend/gameplay/shared/components";
import { getTeamStyle } from "./intel-panel";
import { TeamSymbolIcon } from "../../../../shared/team-symbol-icon";
import styles from "./team-header-panel.module.css";

/**
 * Ghost header — minimal identity row.
 * Shows "AI IS THINKING..." during AI turns in single-device mode.
 */

export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
  variant?: "default" | "compact";
}

export const TeamHeaderPanelView: React.FC<TeamHeaderPanelViewProps> = ({
  teamName,
  role,
  playerName,
  variant = "default",
}) => {
  const { symbol, color, rotate } = getTeamStyle(teamName);

  if (variant === "compact") {
    return (
      <div className={styles.compactRow}>
        <span className={styles.compactName}>{playerName || "AGENT"}</span>
        <span className={styles.compactSymbol} aria-hidden>
          <TeamSymbolIcon symbol={symbol} rotate={rotate} color={color} />
        </span>
        <span className={styles.compactRole}>{role}</span>
      </div>
    );
  }

  return (
    <div className={styles.ghostRow}>
      <span className={styles.playerName}>{playerName || "AGENT"}</span>
      <div className={styles.roleGroup}>
        <span className={styles.symbol} aria-hidden>
          <TeamSymbolIcon symbol={symbol} rotate={rotate} color={color} />
        </span>
        <span className={styles.role}>{role}</span>
      </div>
    </div>
  );
};

interface TeamHeaderPanelProps {
  variant?: "default" | "compact";
}

export const TeamHeaderPanel: React.FC<TeamHeaderPanelProps> = ({ variant }) => {
  const { gameData } = useGameDataRequired();
  const { data: aiStatus } = useAiStatus(gameData.publicId);

  if (aiStatus?.thinking) {
    return (
      <div className={styles.ghostRow}>
        <AwaitingLabel>AI IS THINKING...</AwaitingLabel>
      </div>
    );
  }

  return (
    <TeamHeaderPanelView
      teamName={gameData.playerContext?.teamName || ""}
      role={gameData.playerContext?.role || "SPECTATOR"}
      playerName={gameData.playerContext?.playerName}
      variant={variant}
    />
  );
};
