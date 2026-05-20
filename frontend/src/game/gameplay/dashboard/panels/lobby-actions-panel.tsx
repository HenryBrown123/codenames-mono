import React from "react";
import { useGameDataRequired } from "../../providers";
import { useGameActions } from "..";
import { useDealAnimation } from "../../board/deal-animation-context";
import { useViewMode } from "../../board/view-mode/view-mode-context";
import { useVisibilityContext } from "../config/context";
import { canRedeal } from "../config/rules";
import { ActionButton } from "../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./lobby-actions-panel.module.css";

/** Props for {@link LobbyActionsPanelView}. */
export interface LobbyActionsPanelViewProps {
  buttonText: string;
  canRedeal: boolean;
  isLoading: boolean;
  onPrimaryAction: () => void;
  onRedeal: () => void;
}

/**
 * Presentational lobby actions — a primary "deal / start" button and
 * an optional "redeal" button. Stateless; the parent owns the
 * loading flag and decides which actions are available.
 */
export const LobbyActionsPanelView: React.FC<LobbyActionsPanelViewProps> = ({
  buttonText,
  canRedeal,
  isLoading,
  onPrimaryAction,
  onRedeal,
}) => (
  <TerminalSection>
    <div className={styles.buttonGroup}>
      <ActionButton id="lobby-action-btn" onClick={onPrimaryAction} text={buttonText} enabled={!isLoading} />
      {canRedeal && <ActionButton id="redeal-btn" onClick={onRedeal} text="REDEAL CARDS" enabled={!isLoading} />}
    </div>
  </TerminalSection>
);

/**
 * Connected lobby actions. Derives the primary button label and
 * action from round / cards state, and exposes a redeal button when
 * the visibility rules permit. Triggers the deal animation before
 * mutating server state so the UI doesn't flash-empty between calls.
 */
export const LobbyActionsPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();
  const { triggerDeal } = useDealAnimation();
  const { setViewMode } = useViewMode();
  const ctx = useVisibilityContext();

  const isLoading = actionState.status === "loading";

  const hasRound = gameData.currentRound !== null && gameData.currentRound !== undefined;
  const hasCards = (gameData.currentRound?.cards?.length ?? 0) > 0;
  const isSetup = gameData.currentRound?.status === "SETUP";

  const showRedeal = canRedeal(ctx);

  const handlePrimaryAction = async () => {
    if (isSetup && hasCards) {
      startRound();
      return;
    }

    if (isSetup && !hasCards) {
      try {
        triggerDeal();
        await dealCards(false);
      } catch (error) {
        console.error("Failed to deal cards:", error);
      }
      return;
    }

    if (!hasRound) {
      triggerDeal();
      createRound();
    }
  };

  const handleRedeal = async () => {
    try {
      setViewMode("normal");
      triggerDeal();
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
      canRedeal={showRedeal}
      isLoading={isLoading}
      onPrimaryAction={handlePrimaryAction}
      onRedeal={handleRedeal}
    />
  );
};
