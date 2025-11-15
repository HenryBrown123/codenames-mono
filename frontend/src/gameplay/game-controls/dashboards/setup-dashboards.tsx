import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { PLAYER_ROLE } from "@codenames/shared/types";
import { useGameDataRequired } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { ActionButton } from "../../shared/components";
import { usePlayerScene } from "../../game-scene";
import { TeamSymbolHeader } from "./team-symbol-header";
import {
  TerminalSection,
  TerminalCommand,
  TerminalOutput,
  CenteredContent,
} from "./terminal-components";
import styles from "./setup-dashboards.module.css";

/**
 * Lobby Dashboard - Mobile-first with refresh functionality
 */
export const LobbyDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  if (!gameData) {
    return null;
  }

  // During handoff (IN_PROGRESS with no active player), show blank dashboard
  if (
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE
  ) {
    return (
      <>
        <div className={`${styles.container} mobile-only`} />
        <div className={styles.desktopContainer} />
      </>
    );
  }

  const canRedeal =
    gameData?.currentRound?.status === "SETUP" &&
    gameData.currentRound.cards &&
    gameData.currentRound.cards.length > 0;

  const handleClick = async () => {
    if (
      gameData?.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards &&
      gameData.currentRound.cards.length > 0
    ) {
      startRound();
      return;
    }

    if (
      gameData?.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      try {
        await dealCards(false);
      } catch (error) {
        console.error("Failed to deal cards:", error);
      }
      return;
    }

    if (!gameData?.currentRound) {
      createRound();
    }
  };

  const handleRedeal = async () => {
    try {
      await dealCards(true);
    } catch (error) {
      console.error("Failed to redeal:", error);
    }
  };

  const getButtonText = () => {
    if (!gameData?.currentRound) {
      return "Deal Cards";
    }

    if (
      gameData.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      return "Deal Cards";
    }

    if (gameData.currentRound?.status === "SETUP" && gameData.currentRound.cards?.length > 0) {
      return "Start Round";
    }

    return "Continue Game";
  };

  return (
    <>
      {/* Mobile view */}
      <div className={`${styles.centeredContainer} mobile-only`}>
        {canRedeal && (
          <button
            className={styles.refreshButton}
            onClick={handleRedeal}
            disabled={actionState.status === "loading"}
            title="Re-deal cards"
          >
            <RefreshCw />
          </button>
        )}
        <ActionButton
          onClick={handleClick}
          text={getButtonText()}
          enabled={actionState.status !== "loading"}
        />
      </div>

      {/* Desktop terminal view */}
      <div className={styles.desktopContainer}>
        <CenteredContent layoutId="dashboard-main">
          <TerminalCommand>SYSTEM READY</TerminalCommand>
          <TerminalOutput>
            {messageText || "Initialize mission parameters..."}
            {canRedeal && " Cards dealt."}
          </TerminalOutput>
        </CenteredContent>

        <TerminalSection layoutId="dashboard-actions">
          <div className={styles.buttonGroup}>
            <ActionButton
              onClick={handleClick}
              text={getButtonText()}
              enabled={actionState.status !== "loading"}
            />

            {canRedeal && (
              <ActionButton
                onClick={handleRedeal}
                text="REDEAL CARDS"
                enabled={actionState.status !== "loading"}
              />
            )}
          </div>
        </TerminalSection>
      </div>
    </>
  );
};

/**
 * Generic waiting dashboard
 */
export const WaitingDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();

  return (
    <>
      <div className={`${styles.container} mobile-only`} />
      <div className={styles.desktopContainer}>
        {gameData.playerContext?.teamName && gameData.playerContext?.role ? (
          <>
            <TerminalSection layoutId="waiting-header">
              <TeamSymbolHeader
                teamName={gameData.playerContext.teamName}
                role={gameData.playerContext.role as any}
                playerName={gameData.playerContext.playerName}
              />
            </TerminalSection>
            <CenteredContent layoutId="waiting-message">
              <TerminalCommand>STANDBY MODE</TerminalCommand>
              <TerminalOutput>{messageText || "Waiting for orders..."}</TerminalOutput>
            </CenteredContent>
            <div />
          </>
        ) : (
          <CenteredContent layoutId="waiting-message">
            <TerminalCommand>STANDBY MODE</TerminalCommand>
            <TerminalOutput>{messageText || "Waiting for orders..."}</TerminalOutput>
          </CenteredContent>
        )}
      </div>
    </>
  );
};

/**
 * Spectator dashboard
 */
export const SpectatorDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();

  return (
    <>
      <div className={`${styles.container} mobile-only`} />
      <div className={styles.desktopContainer}>
        {gameData.playerContext?.teamName && gameData.playerContext?.role ? (
          <>
            <TerminalSection layoutId="spectator-header">
              <TeamSymbolHeader
                teamName={gameData.playerContext.teamName}
                role={gameData.playerContext.role as any}
                playerName={gameData.playerContext.playerName}
              />
            </TerminalSection>
            <CenteredContent layoutId="spectator-message">
              <TerminalCommand>OBSERVER MODE</TerminalCommand>
              <TerminalOutput>{messageText || "Monitoring field operations..."}</TerminalOutput>
            </CenteredContent>
            <div />
          </>
        ) : (
          <CenteredContent layoutId="spectator-message">
            <TerminalCommand>OBSERVER MODE</TerminalCommand>
            <TerminalOutput>{messageText || "Monitoring field operations..."}</TerminalOutput>
          </CenteredContent>
        )}
      </div>
    </>
  );
};

/**
 * Dealing dashboard with loading indicator
 */
export const DealingDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  return (
    <>
      <div className={`${styles.centeredContainer} mobile-only`}>
        <div>Dealing cards...</div>
      </div>

      <div className={styles.desktopContainer}>
        <CenteredContent layoutId="dashboard-main">
          <TerminalCommand>SYSTEM PROCESSING</TerminalCommand>
          <TerminalOutput>{messageText || "Dealing cards..."}</TerminalOutput>
        </CenteredContent>
      </div>
    </>
  );
};

/**
 * Game over dashboard with animated stats
 */
export const GameoverDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();
  const { createRound, actionState } = useGameActions();

  const winningTeamName = gameData.currentRound?.winningTeamName;
  const teams = gameData.teams || [];
  const winningTeam = teams.find((t) => t.name === winningTeamName);
  const losingTeam = teams.find((t) => t.name !== winningTeamName);

  const totalTurns = gameData.currentRound?.turns?.length || 0;
  const totalCards = gameData.currentRound?.cards?.filter((c) => c.selected).length || 0;

  useEffect(() => {
    console.log("Rendering game over dash");
  }, []);

  const handleNewGame = () => {
    createRound();
  };

  return (
    <>
      {/* Mobile view */}
      <div className={`${styles.centeredContainer} mobile-only`}>
        <div className={styles.terminalHeader}>MISSION COMPLETE</div>
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
        <ActionButton
          onClick={handleNewGame}
          text="NEW MISSION"
          enabled={actionState.status !== "loading"}
        />
      </div>

      {/* Desktop terminal view */}
      <div className={styles.desktopContainer}>
        <CenteredContent layoutId="dashboard-main">
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
        </CenteredContent>

        <TerminalSection layoutId="dashboard-actions">
          <ActionButton
            onClick={handleNewGame}
            text="NEW MISSION"
            enabled={actionState.status !== "loading"}
          />
        </TerminalSection>
      </div>
    </>
  );
};

/**
 * Blank dashboard for device handoff - shows nothing behind the overlay
 */
export const HandoffDashboard: React.FC<{ messageText?: string }> = () => {
  return (
    <>
      <div className={`${styles.container} mobile-only`} />
      <div className={styles.desktopContainer} />
    </>
  );
};

/**
 * Outcome dashboard - Shows round outcome
 */
export const OutcomeDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { triggerSceneTransition } = usePlayerScene();

  const handleContinue = () => {
    triggerSceneTransition("OUTCOME_ACKNOWLEDGED");
  };

  return (
    <>
      <div className={`${styles.centeredContainer} mobile-only`}>
        <ActionButton onClick={handleContinue} text="Continue" enabled={true} />
      </div>

      <div className={styles.desktopContainer}>
        <CenteredContent layoutId="dashboard-main">
          <TerminalCommand>MISSION OUTCOME</TerminalCommand>
          <TerminalOutput>{messageText || "Analyzing mission results..."}</TerminalOutput>
        </CenteredContent>
        <TerminalSection layoutId="dashboard-actions">
          <ActionButton onClick={handleContinue} text="ACKNOWLEDGE" enabled={true} />
        </TerminalSection>
      </div>
    </>
  );
};
