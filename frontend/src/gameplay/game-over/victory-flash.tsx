import { motion } from "framer-motion";
import { victoryFlashVariants } from "./game-over-animation-variants";
import styles from "./victory-flash.module.css";

interface VictoryFlashProps {
  winnerName: string;
  teamColor: string;
  afterflash: (...args: any[]) => void;
}

export const VictoryFlash = ({ winnerName, teamColor, afterflash }: VictoryFlashProps) => {
  return (
    <motion.div
      className={styles.victoryFlash}
      style={{ "--flash-color": teamColor } as React.CSSProperties}
      variants={victoryFlashVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={afterflash}
    >
      <div className={styles.flashContent}>
        <div className={styles.flashStatus}>MISSION COMPLETE</div>
        <div className={styles.flashWinner}>{winnerName.toUpperCase()}</div>
        <div className={styles.flashSubtext}>VICTORIOUS</div>
      </div>
    </motion.div>
  );
};
