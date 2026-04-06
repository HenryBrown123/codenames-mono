import React from "react";
import { useGameDataRequired } from "../../providers";
import { useVisibilityContext } from "../config/context";
import { getTeamStyle } from "./intel-panel";
import { TeamSymbolIcon } from "@frontend/shared/components/team-symbol-icon";
import styles from "./team-header-panel.module.css";

/**
 * Ghost header — minimal identity row.
 * Shows a neutral placeholder during AI turns (no team/player context).
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
        <span className={styles.compactRole}>{role}</span>
        <span className={styles.compactSymbol} aria-hidden>
          <TeamSymbolIcon symbol={symbol} rotate={rotate} color={color} />
        </span>
      </div>
    );
  }

  return (
    <div className={styles.ghostRow}>
      <span className={styles.playerName}>{playerName || "AGENT"}</span>
      <div className={styles.roleGroup}>
        <span className={styles.role}>{role}</span>
        <span className={styles.symbol} aria-hidden>
          <TeamSymbolIcon symbol={symbol} rotate={rotate} color={color} />
        </span>
      </div>
    </div>
  );
};

interface TeamHeaderPanelProps {
  variant?: "default" | "compact";
}

export const TeamHeaderPanel: React.FC<TeamHeaderPanelProps> = ({ variant }) => {
  const { gameData } = useGameDataRequired();
  const ctx = useVisibilityContext();
  if (ctx.isAiSession) {
    return (
      <TeamHeaderPanelView
        teamName={ctx.activeTeamName ?? ""}
        role={ctx.active?.role ?? ""}
        playerName="[AI]"
        variant={variant}
      />
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
