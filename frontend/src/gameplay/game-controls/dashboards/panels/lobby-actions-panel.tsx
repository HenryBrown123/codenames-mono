import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./lobby-actions-panel.module.css";

/**
 * Pre-game actions: role selection and ready status
 */

export interface LobbyActionsPanelViewProps {
  buttonText: string;
  canRedeal: boolean;
  isLoading: boolean;
  onPrimaryAction: () => void;
  onRedeal: () => void;
}

export const LobbyActionsPanelView: React.FC<LobbyActionsPanelViewProps> = ({
  buttonText,
  canRedeal,
  isLoading,
  onPrimaryAction,
  onRedeal,
}) => (
  <TerminalSection>
    <div className={styles.buttonGroup}>
      <ActionButton onClick={onPrimaryAction} text={buttonText} enabled={!isLoading} />
      {canRedeal && <ActionButton onClick={onRedeal} text="REDEAL CARDS" enabled={!isLoading} />}
    </div>
  </TerminalSection>
);

export const LobbyActionsPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const isLoading = actionState.status === "loading";

  const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;
  const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
  const isSetup = gameData.currentRound?.status === "SETUP";

  const canRedeal = isSetup && hasCards;

  const handlePrimaryAction = async () => {
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
      return "Start Round";
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
    <LobbyActionsPanelView
      buttonText={getButtonText()}
      canRedeal={canRedeal}
      isLoading={isLoading}
      onPrimaryAction={handlePrimaryAction}
      onRedeal={handleRedeal}
    />
  );
};
