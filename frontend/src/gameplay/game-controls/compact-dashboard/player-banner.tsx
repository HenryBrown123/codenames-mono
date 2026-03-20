import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { getTeamStyle } from "../dashboards/panels/intel-panel";
import styles from "./player-banner.module.css";

// Animation constants
const SYMBOL_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

/**
 * Full-width banner showing player identity.
 * Team symbol on left, player name and role on right.
 * Used in portrait mode at the top of the control area.
 */
export const PlayerBanner: React.FC = () => {
  const s = useDashboardState();

  // Don't render if no role assigned
  if (!s.hasRole) return null;

  const { symbol, color, rotate } = getTeamStyle(s.teamName);
  const symbolStyle = rotate
    ? { display: "inline-block" as const, transform: "rotate(45deg)" }
    : undefined;

  return (
    <div className={styles.banner}>
      <AnimatePresence mode="wait">
        <motion.span
          key={s.teamName}
          className={styles.teamSymbol}
          style={{ color }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: SYMBOL_SWITCH_DURATION, ease: EASING }}
        >
          <span style={symbolStyle}>{symbol}</span>
        </motion.span>
      </AnimatePresence>

      <div className={styles.identity}>
        <span className={styles.playerName}>{s.playerName || "AGENT"}</span>
        <span className={styles.roleBadge} style={{ borderColor: color, color }}>
          {s.role}
        </span>
      </div>
    </div>
  );
};
