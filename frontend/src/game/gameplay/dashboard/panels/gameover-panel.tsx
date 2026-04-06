import React from "react";
import { useGameDataRequired } from "../../providers";
import { useGameActions } from "..";
import { ActionButton } from "../../shared/components";
import { TerminalSection, TerminalCommand, ScoreComparison } from "../shared";
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

    <ScoreComparison
      winnerName={winnerStats.name}
      winnerScore={winnerStats.selected}
      loserName={loserStats.name}
      loserScore={loserStats.selected}
    />

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

  /** Check if assassin was selected */
  const assassinSelected = cards.some((c) => c.cardType === "ASSASSIN" && c.selected);

  /** Count cards per team */
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
