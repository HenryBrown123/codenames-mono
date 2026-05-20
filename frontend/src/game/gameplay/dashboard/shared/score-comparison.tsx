import React from "react";
import { getTeamConfig } from "@frontend/shared/types";
import styles from "./score-comparison.module.css";

interface ScoreComparisonProps {
  winnerName: string;
  winnerScore: number;
  loserName: string;
  loserScore: number;
  className?: string;
}

/**
 * Side-by-side team score block. The winner side is rendered with
 * extra emphasis (gold) and the loser side stays muted; team names
 * pick up the team-config CSS variable for colour.
 */
export const ScoreComparison: React.FC<ScoreComparisonProps> = ({
  winnerName,
  winnerScore,
  loserName,
  loserScore,
  className,
}) => (
  <div className={`${styles.scoreComparison} ${className ?? ""}`}>
    <div className={styles.teamScore}>
      <div
        className={styles.teamName}
        style={{ color: getTeamConfig(winnerName).cssVar }}
      >
        {getTeamConfig(winnerName).shortName}
      </div>
      <div className={`${styles.score} ${styles.winner}`}>{winnerScore}</div>
    </div>
    <div className={styles.scoreDivider}>—</div>
    <div className={styles.teamScore}>
      <div
        className={styles.teamName}
        style={{ color: getTeamConfig(loserName).cssVar }}
      >
        {getTeamConfig(loserName).shortName}
      </div>
      <div className={styles.score}>{loserScore}</div>
    </div>
  </div>
);
