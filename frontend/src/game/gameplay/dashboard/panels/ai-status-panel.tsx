import React from "react";
import { useGameDataRequired } from "../../providers";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { GameChatLog } from "@frontend/chat/components";
import { StatusDot } from "../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./ai-status-panel.module.css";

/** Props for {@link AIStatusPanelView}. */
export interface AIStatusPanelViewProps {
  isActive: boolean;
  isThinking?: boolean;
  showTriggerButton: boolean;
  onTrigger?: () => void;
  children?: React.ReactNode;
}

/**
 * Presentational AI-assistant panel. Status dot in the header, chat
 * log / trigger button in the body. Stateless — the container
 * resolves all three booleans from the live AI status.
 */
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

/**
 * Live AI status panel. Subscribes to `useAiStatus` for the active
 * game, wires the manual trigger button to `useTriggerAiMove`, and
 * embeds the chat-log typewriter so AI narration appears alongside
 * the status.
 */
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
