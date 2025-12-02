import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection, TerminalCommand } from "../shared";
import styles from "./gameover-panel.module.css";

/**
 * Gameover Panel - Score display and new game button.
 * Shows final scores and allows starting a new round.
 */
export const GameoverPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, actionState } = useGameActions();

  const winningTeamName = gameData.currentRound?.winningTeamName;
  const teams = gameData.teams || [];
  const winningTeam = teams.find((t) => t.name === winningTeamName);
  const losingTeam = teams.find((t) => t.name !== winningTeamName);

  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter((c) => c.selected).length || 0;

  const handleNewGame = () => {
    createRound();
  };

  const isLoading = actionState.status === "loading";

  return (
    <TerminalSection>
      <TerminalCommand>MISSION COMPLETE</TerminalCommand>

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

      <ActionButton onClick={handleNewGame} text="NEW MISSION" enabled={!isLoading} />
    </TerminalSection>
  );
};
