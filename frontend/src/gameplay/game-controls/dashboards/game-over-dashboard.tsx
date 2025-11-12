import { motion } from "framer-motion";
import { useGameDataRequired } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { ActionButton } from "../../shared/components";
import { debriefOverlayVariants, debriefStatVariants } from "./game-over-dashboard-variants";
import { TerminalSection, TerminalCommand } from "./terminal-components";
import styles from "./shared-dashboard.module.css";

export const GameOverDashboard = () => {
  const { gameData } = useGameDataRequired();
  const { createRound } = useGameActions();

  const winner = gameData.currentRound?.winningTeamName;
  const winningTeam = gameData.teams?.find((team) => team.name === winner);
  const winningScore = gameData.currentRound?.cards?.filter(
    (card) => card.selected && card.teamName === winner,
  ).length;

  const losingTeam = gameData.teams?.find((team) => team.name !== winner);
  const losingScore = gameData.currentRound?.cards?.filter(
    (card) => card.selected && card.teamName === losingTeam?.name,
  ).length;

  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter((c) => c.selected).length || 0;

  return (
    <>
      {/* Mobile view */}
      <motion.div
        className={`${styles.dashboardContainer} mobile-only`}
        variants={debriefOverlayVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.infoDisplay} variants={debriefStatVariants}>
          <div className={styles.terminalHeader}>MISSION COMPLETE</div>
        </motion.div>

        <motion.div className={styles.dashboardSection} variants={debriefStatVariants}>
          <div className={styles.scoreComparison}>
            <div className={styles.teamScore}>
              <div className={styles.teamName}>{winningTeam?.name.toUpperCase()}</div>
              <div className={`${styles.score} ${styles.winner}`}>{winningTeam?.score}</div>
            </div>
            <div className={styles.scoreDivider}>—</div>
            <div className={styles.teamScore}>
              <div className={styles.teamName}>{losingTeam?.name.toUpperCase()}</div>
              <div className={styles.score}>{losingTeam?.score}</div>
            </div>
          </div>

          <div className={styles.secondaryStats}>
            <div className={styles.miniStat}>
              <span>{totalTurns}</span> TURNS
            </div>
            <div className={styles.miniStat}>
              <span>{totalCards}</span> / 25 REVEALED
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.dashboardSection} variants={debriefStatVariants}>
          <div className={styles.actionSingle}>
            <button className={styles.primaryAction} onClick={() => createRound()}>
              NEW MISSION
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop view */}
      <motion.div
        className={styles.desktopContainer}
        variants={debriefOverlayVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={debriefStatVariants}>
          <TerminalSection layoutId="dashboard-header">
            <TerminalCommand>MISSION COMPLETE</TerminalCommand>
          </TerminalSection>
        </motion.div>

        <motion.div variants={debriefStatVariants}>
          <TerminalSection layoutId="dashboard-scores">
            <div className={styles.scoreComparison}>
              <div className={styles.teamScore}>
                <div className={styles.teamName}>{winningTeam?.name.toUpperCase()}</div>
                <div className={`${styles.score} ${styles.winner}`}>{winningScore}</div>
              </div>
              <div className={styles.scoreDivider}>—</div>
              <div className={styles.teamScore}>
                <div className={styles.teamName}>{losingTeam?.name.toUpperCase()}</div>
                <div className={styles.score}>{losingScore}</div>
              </div>
            </div>

            <div className={styles.secondaryStats}>
              <div className={styles.miniStat}>
                <span>{totalTurns}</span> TURNS
              </div>
              <div className={styles.miniStat}>
                <span>{totalCards}</span> / 25 REVEALED
              </div>
            </div>
          </TerminalSection>
        </motion.div>

        <motion.div variants={debriefStatVariants}>
          <TerminalSection layoutId="dashboard-actions">
            <ActionButton onClick={() => createRound()} text="NEW MISSION" enabled={true} />
          </TerminalSection>
        </motion.div>
      </motion.div>
    </>
  );
};
