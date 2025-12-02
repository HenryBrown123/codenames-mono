import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection, TerminalCommand } from "../shared";
import styles from "./gameover-panel.module.css";

/**
 * End-of-game panel with winner announcement and play again option
 */

export interface GameoverPanelViewProps {
  winnerName?: string;
  winnerScore?: number;
  loserName?: string;
  loserScore?: number;
  totalTurns: number;
  totalCardsRevealed: number;
  isLoading: boolean;
  onNewGame: () => void;
}

export const GameoverPanelView: React.FC<GameoverPanelViewProps> = ({
  winnerName,
  winnerScore,
  loserName,
  loserScore,
  totalTurns,
  totalCardsRevealed,
  isLoading,
  onNewGame,
}) => (
  <TerminalSection>
      <TerminalCommand>MISSION COMPLETE</TerminalCommand>

      <div className={styles.scoreComparison}>
        <div className={styles.teamScore}>
          <div className={styles.teamName}>{winnerName?.toUpperCase()}</div>
          <div className={`${styles.score} ${styles.winner}`}>{winnerScore}</div>
        </div>
        <div className={styles.scoreDivider}>—</div>
        <div className={styles.teamScore}>
          <div className={styles.teamName}>{loserName?.toUpperCase()}</div>
          <div className={styles.score}>{loserScore}</div>
        </div>
      </div>

      <div className={styles.secondaryStats}>
        <div className={styles.miniStat}>
          <span>{totalTurns}</span> TURNS
        </div>
        <div className={styles.miniStat}>
          <span>{totalCardsRevealed}</span> / 25 REVEALED
        </div>
      </div>

      <ActionButton onClick={onNewGame} text="NEW MISSION" enabled={!isLoading} />
    </TerminalSection>
);

export const GameoverPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, actionState } = useGameActions();

  const winningTeamName = gameData.currentRound?.winningTeamName;
  const teams = gameData.teams || [];
  const winningTeam = teams.find((t) => t.name === winningTeamName);
  const losingTeam = teams.find((t) => t.name !== winningTeamName);

  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCardsRevealed = gameData.currentRound?.cards?.filter((c) => c.selected).length || 0;

  return (
    <GameoverPanelView
      winnerName={winningTeam?.name}
      winnerScore={winningTeam?.score}
      loserName={losingTeam?.name}
      loserScore={losingTeam?.score}
      totalTurns={totalTurns}
      totalCardsRevealed={totalCardsRevealed}
      isLoading={actionState.status === "loading"}
      onNewGame={createRound}
    />
  );
};
