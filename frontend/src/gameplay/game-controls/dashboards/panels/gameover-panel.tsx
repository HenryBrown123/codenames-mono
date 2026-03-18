import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection, TerminalCommand } from "../shared";
import styles from "./gameover-panel.module.css";

/**
 * End-of-game panel with winner announcement and play again option
 */

interface TeamCardStats {
  name: string;
  selected: number;
  total: number;
  isWinner: boolean;
}

export interface GameoverPanelViewProps {
  winnerStats: TeamCardStats;
  loserStats: TeamCardStats;
  assassinSelected: boolean;
  isLoading: boolean;
  onNewGame: () => void;
}

export const GameoverPanelView: React.FC<GameoverPanelViewProps> = ({
  winnerStats,
  loserStats,
  assassinSelected,
  isLoading,
  onNewGame,
}) => (
  <TerminalSection>
    <TerminalCommand>MISSION COMPLETE</TerminalCommand>

    {assassinSelected && (
      <div className={styles.assassinAlert}>
        <span className={styles.assassinIcon}>☠</span>
        <span>ASSASSIN SELECTED</span>
      </div>
    )}

    <div className={styles.scoreComparison}>
      <div className={styles.teamScore}>
        <div className={styles.teamName}>{winnerStats.name.toUpperCase()}</div>
        <div className={`${styles.score} ${styles.winner}`}>{winnerStats.selected}</div>
      </div>
      <div className={styles.scoreDivider}>—</div>
      <div className={styles.teamScore}>
        <div className={styles.teamName}>{loserStats.name.toUpperCase()}</div>
        <div className={styles.score}>{loserStats.selected}</div>
      </div>
    </div>

    <ActionButton onClick={onNewGame} text="NEW MISSION" enabled={!isLoading} />
  </TerminalSection>
);

export const GameoverPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, actionState } = useGameActions();

  const cards = gameData.currentRound?.cards || [];
  const winningTeamName = gameData.currentRound?.winningTeamName;
  const teams = gameData.teams || [];
  const winningTeam = teams.find((t) => t.name === winningTeamName);
  const losingTeam = teams.find((t) => t.name !== winningTeamName);

  // Check if assassin was selected
  const assassinSelected = cards.some((c) => c.cardType === "ASSASSIN" && c.selected);

  // Count cards per team
  const getTeamCardStats = (teamName: string | undefined, isWinner: boolean): TeamCardStats => {
    const teamCards = cards.filter((c) => c.teamName === teamName);
    const selectedCards = teamCards.filter((c) => c.selected);
    return {
      name: teamName || "TEAM",
      selected: selectedCards.length,
      total: teamCards.length,
      isWinner,
    };
  };

  const winnerStats = getTeamCardStats(winningTeam?.name, true);
  const loserStats = getTeamCardStats(losingTeam?.name, false);

  return (
    <GameoverPanelView
      winnerStats={winnerStats}
      loserStats={loserStats}
      assassinSelected={assassinSelected}
      isLoading={actionState.status === "loading"}
      onNewGame={createRound}
    />
  );
};
