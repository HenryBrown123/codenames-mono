import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { StatusDot } from "@frontend/game/gameplay/shared/components";
import styles from "./ai-status-indicator.module.css";

/**
 * AI thinking indicator with expandable chat log panel
 */

export interface AiStatusIndicatorViewProps {
  isActive: boolean;
  isThinking: boolean;
  showTriggerButton: boolean;
  onTrigger?: () => void;
}

export const AiStatusIndicatorView: React.FC<AiStatusIndicatorViewProps> = ({
  isActive,
  isThinking,
  showTriggerButton,
  onTrigger,
}) => (
  <div className={styles.aiStatusContainer}>
    <div className={styles.aiStatusRow}>
      <StatusDot active={isActive} />
      {!isActive && (
        <span className={styles.aiStatusText}>{isThinking ? "" : "Unavailable"}</span>
      )}
      <AnimatePresence mode="wait">
        {showTriggerButton ? (
          <motion.button
            key="trigger-button"
            className={styles.triggerButton}
            onClick={onTrigger}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            Trigger AI
          </motion.button>
        ) : isThinking ? (
          <motion.span
            key="thinking-text"
            className={styles.thinkingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Processing...
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  </div>
);

interface AiStatusIndicatorProps {
  gameId: string;
}

export const AiStatusIndicator: React.FC<AiStatusIndicatorProps> = ({ gameId }) => {
  const { data: aiStatus, isLoading, error } = useAiStatus(gameId);
  const triggerMove = useTriggerAiMove(gameId);

  console.debug("[AI] AiStatusIndicator render:", {
    gameId,
    aiStatus,
    isLoading,
    error: error?.message,
    triggerPending: triggerMove.isPending,
  });

  if (!aiStatus) {
    console.debug("[AI] AiStatusIndicator: No AI status data yet");
    return null;
  }

  const isThinking = aiStatus.thinking || triggerMove.isPending;
  const showTriggerButton = aiStatus.available && !isThinking;
  const isActive = aiStatus.available || false;

  console.debug("[AI] AiStatusIndicator derived state:", {
    isActive,
    isThinking,
    showTriggerButton,
  });

  return (
    <AiStatusIndicatorView
      isActive={isActive}
      isThinking={isThinking}
      showTriggerButton={showTriggerButton}
      onTrigger={() => {
        console.debug("[AI] Trigger button clicked");
        triggerMove.mutate();
      }}
    />
  );
};
