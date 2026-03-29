import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { getTeamStyle } from "../dashboards/panels/intel-panel";
import { TeamSymbolIcon } from "../../../shared/team-symbol-icon";
import styles from "./player-banner.module.css";

const SYMBOL_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

/**
 * Full-width banner showing player identity.
 * Shows a neutral placeholder during AI turns (no team/player context).
 */
export const PlayerBanner: React.FC = () => {
  const s = useDashboardState();

  if (s.isAiActive) {
    return (
      <div className={styles.banner}>
        <div className={styles.identity}>
          <span className={styles.playerName}>WAITING</span>
        </div>
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
