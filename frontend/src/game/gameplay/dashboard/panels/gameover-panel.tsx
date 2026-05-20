import React from "react";
import { useGameDataRequired } from "../../providers";
import { useGameActions } from "..";
import { ActionButton } from "../../shared/components";
import { TerminalSection, TerminalCommand, ScoreComparison } from "../shared";
import styles from "./gameover-panel.module.css";

interface TeamCardStats {
  name: string;
  selected: number;
  total: number;
  isWinner: boolean;
}

/** Props for {@link GameoverPanelView}. */
export interface GameoverPanelViewProps {
  winnerStats: TeamCardStats;
  loserStats: TeamCardStats;
  assassinSelected: boolean;
  isLoading: boolean;
  onNewGame: () => void;
}

/**
 * Presentational end-of-round panel — score breakdown, optional
 * assassin alert and a "new mission" button. Stateless.
 */
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

/**
 * Connected end-of-round panel. Computes winner/loser card counts
 * and the assassin-selected flag from `gameData`, then forwards to
 * {@link GameoverPanelView}.
 */
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
