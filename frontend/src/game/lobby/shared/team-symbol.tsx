import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamSymbolIcon } from "@frontend/shared/components/team-symbol-icon";
import styles from "./team-symbol.module.css";

interface TeamSymbolProps {
  teamName: "Team Red" | "Team Blue";
  teamColor: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const TEAM_SWITCH_DURATION = 0.3;
const EASING = [0.4, 0, 0.2, 1] as const;

export const TeamSymbol: React.FC<TeamSymbolProps> = ({
  teamName,
  teamColor,
  className,
  onClick,
  disabled = false,
}) => {
  const isRed = teamName === "Team Red";

  const symbol = (
    <AnimatePresence mode="wait">
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
    </AnimatePresence>
  );

  if (onClick) {
    return (
      <button onClick={onClick} disabled={disabled} className={styles.resetButton}>
        {symbol}
      </button>
    );
  }

  return symbol;
};
