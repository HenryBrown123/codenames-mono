import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import type { AiStatus } from "@frontend/ai/api";
import { StatusDot } from "@frontend/gameplay/shared/components";
import styles from "./ai-status-indicator.module.css";

// ============================================================================
// PRESENTATIONAL COMPONENT - Pure, no hooks
// ============================================================================

export interface AiStatusIndicatorViewProps {
  aiStatus: AiStatus | null;
  isPending?: boolean;
  onTrigger?: () => void;
}

/**
 * AI Status Indicator View - Pure presentational component
 * Shows whether AI can be triggered and provides a manual trigger button
 */
export const AiStatusIndicatorView: React.FC<AiStatusIndicatorViewProps> = ({
  aiStatus,
  isPending = false,
  onTrigger,
}) => {
  // Don't render if no status yet
  if (!aiStatus) {
    return null;
  }

  // Backend decides everything - just use the flags
  const isThinking = aiStatus.thinking || isPending;
  const showButton = aiStatus.available && !isThinking && onTrigger;
  const enableIndicator = aiStatus.available || false;

  return (
    <div className={styles.aiStatusContainer}>
      <div className={styles.aiStatusRow}>
        <StatusDot active={enableIndicator} />
        {!enableIndicator && (
          <span className={styles.aiStatusText}>{isThinking ? "" : "Unavailable"}</span>
        )}
        <AnimatePresence mode="wait">
          {showButton ? (
            <motion.button
              key="trigger-button"
              className={styles.triggerButton}
              onClick={onTrigger}
              disabled={isPending}
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
};

// ============================================================================
// CONNECTED COMPONENT - Fetches data and passes to view
// ============================================================================

interface AiStatusIndicatorProps {
  gameId: string;
}

/**
 * AI Status Indicator - Connected component that fetches data
 */
export const AiStatusIndicator: React.FC<AiStatusIndicatorProps> = ({ gameId }) => {
  const { data: aiStatus } = useAiStatus(gameId);
  const triggerMove = useTriggerAiMove(gameId);

  return (
    <AiStatusIndicatorView
      aiStatus={aiStatus ?? null}
      isPending={triggerMove.isPending}
      onTrigger={() => triggerMove.mutate()}
    />
  );
};
