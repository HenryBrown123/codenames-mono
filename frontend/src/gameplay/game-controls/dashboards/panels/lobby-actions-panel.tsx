import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./lobby-actions-panel.module.css";

/**
 * Lobby Actions Panel - Deal/start/redeal buttons.
 * Controls for game setup phase.
 */
export const LobbyActionsPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const isLoading = actionState.status === "loading";

  const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;
  const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
  const isSetup = gameData.currentRound?.status === "SETUP";

  const canRedeal = isSetup && hasCards;

  const handleClick = async () => {
    if (isSetup && hasCards) {
      startRound();
      return;
    }

    if (isSetup && !hasCards) {
      try {
        await dealCards(false);
      } catch (error) {
        console.error("Failed to deal cards:", error);
      }
      return;
    }

    if (!hasRound) {
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
    if (!hasRound) {
      return "Deal Cards";
    }

    if (isSetup && !hasCards) {
      return "Deal Cards";
    }

    if (isSetup && hasCards) {
      return "Start Round";
    }

    return "Continue Game";
  };

  return (
    <TerminalSection>
      <div className={styles.buttonGroup}>
        <ActionButton onClick={handleClick} text={getButtonText()} enabled={!isLoading} />

        {canRedeal && (
          <ActionButton onClick={handleRedeal} text="REDEAL CARDS" enabled={!isLoading} />
        )}
      </div>
    </TerminalSection>
  );
};
