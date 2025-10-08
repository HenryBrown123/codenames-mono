import React from "react";
import { RefreshCw } from "lucide-react";
import { useGameDataRequired } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { ActionButton } from "../../shared/components";
import { usePlayerScene } from "../../game-scene";
import {
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalStatus,
  TerminalOutput,
} from "./terminal-components";
import styles from "./setup-dashboards.module.css";
import { useCardVisibilityStore } from "@frontend/gameplay/game-board";
import { useAnimationEngine } from "@frontend/gameplay/animations";
/**
 * Lobby Dashboard - Mobile-first with refresh functionality
 */
export const LobbyDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();
  const dealCardsFromStore = useCardVisibilityStore((state) => state.dealCards);
  const animationEngine = useAnimationEngine();

  if (!gameData) {
    return null;
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
      console.log("[Click Handler] About to run call dealCards mutation", new Date());
      await dealCards();

      console.log("[Click Handler] About to run dealCardsFromStore", new Date());
      const words = gameData.currentRound.cards.map((c) => c.word);
      dealCardsFromStore(words, animationEngine);
      return;
    }

    if (!gameData?.currentRound) {
      createRound();
      return;
    }
  };

  const handleRedeal = async () => {
    console.log("[Click Handler] About to run call dealCards mutation", new Date());
    await dealCards(true);

    console.log("[Click Handler] About to run dealCardsFromStore", new Date());
    const words = gameData.currentRound!.cards.map((c) => c.word);
    dealCardsFromStore(words, animationEngine);
    return;
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
        <TerminalSection>
          <TerminalCommand>SYSTEM READY</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Initialize mission parameters..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {canRedeal && (
          <TerminalSection>
            <TerminalStatus>Cards dealt. Verify configuration or request new deal.</TerminalStatus>
          </TerminalSection>
        )}

        <TerminalSection>
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
  return (
    <>
      <div className={`${styles.container} mobile-only`} />
      <div className={styles.desktopContainer}>
        <TerminalSection>
          <TerminalCommand>STANDBY MODE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Waiting for orders..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>
      </div>
    </>
  );
};

/**
 * Spectator dashboard
 */
export const SpectatorDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  return (
    <>
      <div className={`${styles.container} mobile-only`} />
      <div className={styles.desktopContainer}>
        <TerminalSection>
          <TerminalCommand>OBSERVER MODE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Monitoring field operations..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>
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
        <TerminalSection>
          <TerminalCommand>SYSTEM PROCESSING</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Dealing cards..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>
      </div>
    </>
  );
};

/**
 * Game over dashboard
 */
export const GameoverDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { createRound, actionState } = useGameActions();

  const handleNewGame = () => {
    createRound();
  };

  return (
    <>
      <div className={`${styles.centeredContainer} mobile-only`}>
        <ActionButton
          onClick={handleNewGame}
          text="New Game"
          enabled={actionState.status !== "loading"}
        />
      </div>

      <div className={styles.desktopContainer}>
        <TerminalSection>
          <TerminalCommand>MISSION COMPLETE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>
              {messageText || "Mission concluded. Ready for new assignment."}
            </TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        <TerminalSection />

        <TerminalSection>
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
        <TerminalSection>
          <TerminalCommand>MISSION OUTCOME</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Analyzing mission results..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        <TerminalSection />

        <TerminalSection>
          <ActionButton onClick={handleContinue} text="ACKNOWLEDGE" enabled={true} />
        </TerminalSection>
      </div>
    </>
  );
};
