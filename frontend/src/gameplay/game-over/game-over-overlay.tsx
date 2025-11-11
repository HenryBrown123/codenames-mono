import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameDataRequired } from "../game-data/providers";
import { useGameActions } from "../game-actions";
import { ActionButton } from "../shared/components";
import { VictoryFlash } from "./victory-flash";
import { debriefOverlayVariants, debriefStatVariants } from "./game-over-animation-variants";
import { GAME_OVER_TIMING } from "./game-over-timing";
import styles from "./game-over-overlay.module.css";

type GameOverPhase = "flash" | "debrief";

export const GameOverOverlay = () => {
  const { gameData } = useGameDataRequired();
  const { createRound } = useGameActions();
  const [phase, setPhase] = useState<GameOverPhase>("flash");

  const winningTeam = gameData.teams?.find((team) => team.score >= 9);
  const losingTeam = gameData.teams?.find((team) => team.score < 9);

  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter((c) => c.selected).length || 0;

  const afterFlashHandler = useCallback(() => {
    console.log("finished flash");
    setPhase("debrief");
  }, []);

  const teamColor = winningTeam?.name.includes("Red")
    ? "var(--color-team-red)"
    : "var(--color-team-blue)";

  return (
    <>
      {phase === "flash" && (
        <AnimatePresence>
          <VictoryFlash
            winnerName={winningTeam?.name || "TEAM"}
            teamColor={teamColor}
            afterflash={afterFlashHandler}
          />
        </AnimatePresence>
      )}
      {phase === "debrief" && (
        <motion.div
          className={styles.overlay}
          style={{ "--winning-color": teamColor } as React.CSSProperties}
          variants={debriefOverlayVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.content}>
            <motion.div variants={debriefStatVariants}>
              <div className={styles.terminalHeader}>MISSION COMPLETE</div>
            </motion.div>

            <motion.div className={styles.scoreComparison} variants={debriefStatVariants}>
              <div className={styles.teamScore}>
                <div className={styles.teamName}>{winningTeam?.name.toUpperCase()}</div>
                <div className={`${styles.score} ${styles.winner}`}>{winningTeam?.score}</div>
              </div>
              <div className={styles.scoreDivider}>—</div>
              <div className={styles.teamScore}>
                <div className={styles.teamName}>{losingTeam?.name.toUpperCase()}</div>
                <div className={styles.score}>{losingTeam?.score}</div>
              </div>
            </motion.div>

            <motion.div className={styles.secondaryStats} variants={debriefStatVariants}>
              <div className={styles.miniStat}>
                <span>{totalTurns}</span> TURNS
              </div>
              <div className={styles.miniStat}>
                <span>{totalCards}</span> / 25 REVEALED
              </div>
            </motion.div>

            <motion.div variants={debriefStatVariants}>
              <ActionButton onClick={() => createRound()} text="NEW MISSION" enabled={true} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
