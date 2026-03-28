import React from "react";
import styles from "./score-comparison.module.css";

interface ScoreComparisonProps {
  winnerName: string;
  winnerScore: number;
  loserName: string;
  loserScore: number;
  className?: string;
}

export const ScoreComparison: React.FC<ScoreComparisonProps> = ({
  winnerName,
  winnerScore,
  loserName,
  loserScore,
  className,
}) => (
  <div className={`${styles.scoreComparison} ${className ?? ""}`}>
    <div className={styles.teamScore}>
      <div className={styles.teamName}>{winnerName.toUpperCase()}</div>
      <div className={`${styles.score} ${styles.winner}`}>{winnerScore}</div>
    </div>
    <div className={styles.scoreDivider}>—</div>
    <div className={styles.teamScore}>
      <div className={styles.teamName}>{loserName.toUpperCase()}</div>
      <div className={styles.score}>{loserScore}</div>
    </div>
  </div>
);
