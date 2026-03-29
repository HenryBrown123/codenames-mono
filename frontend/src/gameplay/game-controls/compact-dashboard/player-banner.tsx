import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { useGameDataRequired } from "../../game-data/providers";
import { useAiStatus } from "@frontend/ai/api";
import { getTeamStyle } from "../dashboards/panels/intel-panel";
import { TeamSymbolIcon } from "../../../shared/team-symbol-icon";
import { AwaitingLabel } from "@frontend/gameplay/shared/components";
import styles from "./player-banner.module.css";

const SYMBOL_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

/**
 * Full-width banner showing player identity.
 * In single-device mode during an AI turn, shows "AI IS THINKING..." instead.
 */
export const PlayerBanner: React.FC = () => {
  const s = useDashboardState();
  const { gameData } = useGameDataRequired();
  const { data: aiStatus } = useAiStatus(gameData.publicId);

  if (aiStatus?.thinking) {
    return (
      <div className={styles.banner}>
        <AwaitingLabel>AI IS THINKING...</AwaitingLabel>
      </div>
    );
  }

  if (!s.hasRole) return null;

  const { symbol, color, rotate } = getTeamStyle(s.teamName);

  return (
    <div className={styles.banner}>
      <AnimatePresence mode="wait">
        <motion.span
          key={s.teamName}
          className={styles.teamSymbol}
          style={{ "--symbol-color": color } as React.CSSProperties}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: SYMBOL_SWITCH_DURATION, ease: EASING }}
        >
          <TeamSymbolIcon symbol={symbol} rotate={rotate} />
        </motion.span>
      </AnimatePresence>

      <div className={styles.identity}>
        <span className={styles.playerName}>{s.playerName || "AGENT"}</span>
        <span className={styles.roleBadge} style={{ "--symbol-color": color } as React.CSSProperties}>
          {s.role}
        </span>
      </div>
    </div>
  );
};
