import React from "react";
import { motion } from "framer-motion";
import { TeamSymbolIcon } from "@frontend/shared/components/team-symbol-icon";
import styles from "./team-symbol.module.css";

/**
 * Team logo symbol with optional button behavior
 */

interface TeamSymbolProps {
  teamName: "Team Red" | "Team Blue";
  teamColor: string;
  className?: string;
  onClick?: () => void;
  isButton?: boolean;
}

// Match timing constants from multi-device-lobby
const TEAM_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

export const TeamSymbol: React.FC<TeamSymbolProps> = ({
  teamName,
  teamColor,
  className,
  onClick,
  isButton = false,
}) => {
  const isRed = teamName === "Team Red";

  const content = (
    <motion.div
      className={className}
      style={{ "--symbol-color": teamColor } as React.CSSProperties}
      key={teamName}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ duration: TEAM_SWITCH_DURATION, ease: EASING }}
    >
      <TeamSymbolIcon symbol="■" rotate={isRed} />
    </motion.div>
  );

  if (isButton && onClick) {
    return (
      <motion.button
        onClick={onClick}
        className={styles.resetButton}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        {content}
      </motion.button>
    );
  }

  return content;
};
