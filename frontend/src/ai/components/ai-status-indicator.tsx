import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { StatusDot } from "@frontend/gameplay/shared/components";
import styles from "./ai-status-indicator.module.css";

interface AiStatusIndicatorProps {
  gameId: string;
}

/**
 * AI Status Indicator Component
 * Shows whether AI can be triggered and provides a manual trigger button
 */
export const AiStatusIndicator: React.FC<AiStatusIndicatorProps> = ({ gameId }) => {
  const { data: aiStatus } = useAiStatus(gameId);
  const triggerMove = useTriggerAiMove(gameId);

  // Backend decides everything - just use the flags
  const isThinking = aiStatus?.thinking || triggerMove.isPending;
  const showButton = aiStatus?.available && !isThinking;

  // Don't render if no status yet
  if (!aiStatus) {
    return null;
  }

  // Don't render if AI is neither available nor thinking (no AI in game)
  if (!aiStatus.available && !aiStatus.thinking) {
    return null;
  }

  return (
    <div className={styles.aiStatusContainer}>
      <div className={styles.aiStatusRow}>
        <StatusDot active={!isThinking} />
        <span className={styles.aiStatusText}>
          {isThinking ? "AI Thinking..." : "AI Ready"}
        </span>
        <AnimatePresence mode="wait">
          {showButton ? (
            <motion.button
              key="trigger-button"
              className={styles.triggerButton}
              onClick={() => triggerMove.mutate()}
              disabled={triggerMove.isPending}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              TRIGGER AI
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
};
