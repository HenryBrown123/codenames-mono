import React from "react";
import { useGameDataRequired } from "../../providers";
import { useVisibilityContext } from "../config/context";
import { getTeamStyle } from "./intel-panel";
import { TeamSymbolIcon } from "@frontend/shared/components/team-symbol-icon";
import styles from "./team-header-panel.module.css";

/** Props for {@link TeamHeaderPanelView}. */
export interface TeamHeaderPanelViewProps {
  teamName: string;
  role: string;
  playerName?: string;
  /** `compact` packs name + role + symbol into a single row; default stacks them. */
  variant?: "default" | "compact";
}

/**
 * Identity strip showing the viewer's player name, role and team
 * symbol. Falls back to `AGENT` when the player name is unknown
 * (anonymous / AI-only sessions).
 */
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

/**
 * Connected team header. Prefers the viewer's player context; falls
 * back to the active AI player during solo AI sessions, or a generic
 * spectator label otherwise.
 */
export const TeamHeaderPanel: React.FC<TeamHeaderPanelProps> = ({ variant }) => {
  const { gameData } = useGameDataRequired();
  const ctx = useVisibilityContext();

  // Always prefer the real player context (multi-device with AI teammate)
  if (gameData.playerContext) {
    return (
      <TeamHeaderPanelView
        teamName={gameData.playerContext.teamName || ""}
        role={gameData.playerContext.role || "SPECTATOR"}
        playerName={gameData.playerContext.playerName}
        variant={variant}
      />
    );
  }

  // Solo AI session — no player context at all
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
      teamName=""
      role="SPECTATOR"
      variant={variant}
    />
  );
};
