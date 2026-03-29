import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamConfig } from "@frontend/shared-types";
import { ActionButton, AwaitingLabel, pageContainerStyles } from "@frontend/gameplay/shared/components";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { usePlayersQuery } from "../game-data/queries";
import type { GameData } from "@frontend/shared-types";
import styles from "./device-handoff-overlay.module.css";

/**
 * Full-screen overlay shown during AI sub-turns in single-device mode.
 * Replaces the device handoff — no passing required, just trigger the AI.
 */

const EASE = [0.4, 0, 0.2, 1] as const;

interface AiTurnOverlayProps {
  gameData: GameData;
}

export const AiTurnOverlay: React.FC<AiTurnOverlayProps> = ({ gameData }) => {
  const { data: aiStatus } = useAiStatus(gameData.publicId);
  const { data: players } = usePlayersQuery(gameData.publicId);
  const triggerMove = useTriggerAiMove(gameData.publicId);

  const isThinking = aiStatus?.thinking || triggerMove.isPending;
  const isVisible = aiStatus?.available || isThinking;

  const activePlayer = players?.find((p) => p.status === "ACTIVE");
  const teamConfig = activePlayer ? getTeamConfig(activePlayer.teamName) : null;
  const isSpymaster = activePlayer?.role === "CODEMASTER";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.overlayContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
        >
          <div className={styles.backgroundBlur} />

          <motion.div
            className={pageContainerStyles.card}
            style={{ maxWidth: 480 }}
            initial={{ scale: 0.85, y: 16 }}
            animate={{ scale: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
            exit={{ scale: 0, transition: { duration: 0.4, ease: EASE } }}
          >
            <h1 className={styles.title}>AI TURN</h1>

            {teamConfig && activePlayer && (
              <div
                className={styles.playerInfo}
                style={{ "--team-color": teamConfig.cssVar } as React.CSSProperties}
              >
                <div className={styles.playerName}>{activePlayer.teamName}</div>
                <div className={styles.roleLabel}>
                  {teamConfig.symbol} {isSpymaster ? "Spymaster" : "Operatives"}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isThinking ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AwaitingLabel>AI IS THINKING...</AwaitingLabel>
                </motion.div>
              ) : (
                <motion.div
                  key="trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ActionButton
                    text="TRIGGER AI"
                    onClick={() => triggerMove.mutate()}
                    enabled={!isThinking}
                    fullWidth
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
