import { motion } from 'framer-motion';
import { useGameDataRequired } from '../../game-data/providers';
import { useGameActions } from '../../game-actions';
import { ActionButton } from '../../shared/components';
import { 
  debriefOverlayVariants,
  debriefStatVariants 
} from '../../game-over/game-over-animation-variants';
import styles from './shared-dashboard.module.css';

export const GameOverDashboard = () => {
  const { gameData } = useGameDataRequired();
  const { createRound } = useGameActions();

  console.log('🎯 GameOverDashboard MOUNTING - Fresh instance!');
  console.log('debriefOverlayVariants:', debriefOverlayVariants);
  console.log('variants.visible.transition:', debriefOverlayVariants.visible.transition);

  const winningTeam = gameData.teams?.find((team) => team.score >= 9);
  const losingTeam = gameData.teams?.find((team) => team.score < 9);
  
  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter(c => c.selected).length || 0;

  return (
    <motion.div 
      className={styles.dashboardContainer}
      variants={debriefOverlayVariants}
      initial="hidden"
      animate="visible"
      onAnimationStart={() => console.log('⏱️ Animation STARTED')}
      onAnimationComplete={() => console.log('✅ Animation COMPLETE')}
    >
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
        <ActionButton
          onClick={() => createRound()}
          text="NEW MISSION"
          enabled={true}
        />
      </motion.div>
    </motion.div>
  );
};
