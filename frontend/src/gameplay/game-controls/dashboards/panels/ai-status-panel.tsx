import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { GameChatLog } from "@frontend/chat/components";
import { StatusDot } from "../../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./ai-status-panel.module.css";

/**
 * Panel showing AI thinking status and chat history.
 * Status dot is in the header, body contains chat log and optional trigger button.
 */

export interface AIStatusPanelViewProps {
  isActive: boolean;
  isThinking?: boolean;
  showTriggerButton: boolean;
  onTrigger?: () => void;
  children?: React.ReactNode;
}

export const AIStatusPanelView: React.FC<AIStatusPanelViewProps> = ({
  isActive,
  isThinking = false,
  showTriggerButton,
  onTrigger,
  children,
}) => (
  <TerminalSection>
    <div className={styles.header}>
      <span className={styles.title}>AI ASSISTANT</span>
      <StatusDot active={isActive} thinking={isThinking} />
    </div>
    <div className={styles.body}>
      {children}
      {showTriggerButton && (
        <button className={styles.triggerButton} onClick={onTrigger}>
          Trigger AI
        </button>
      )}
    </div>
  </TerminalSection>
);

export const AIStatusPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { data: aiStatus, isLoading, error } = useAiStatus(gameData.publicId);
  const triggerMove = useTriggerAiMove(gameData.publicId);

  console.debug("[AI] AIStatusPanel render:", {
    gameId: gameData.publicId,
    aiStatus,
    isLoading,
    error: error?.message,
    triggerPending: triggerMove.isPending,
    triggerError: triggerMove.error?.message,
  });

  const isThinking = aiStatus?.thinking || triggerMove.isPending;
  const showTriggerButton = (aiStatus?.available && !isThinking) || false;
  const isActive = aiStatus?.available || false;

  console.debug("[AI] AIStatusPanel derived:", { isActive, isThinking, showTriggerButton });

  return (
    <AIStatusPanelView
      isActive={isActive}
      isThinking={isThinking}
      showTriggerButton={showTriggerButton}
      onTrigger={() => {
        console.debug("[AI] AIStatusPanel trigger button clicked, calling mutate()");
        triggerMove.mutate();
      }}
    >
      <GameChatLog gameId={gameData.publicId} />
    </AIStatusPanelView>
  );
};
