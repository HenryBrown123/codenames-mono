import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeamConfig } from "@frontend/shared-types";
import { ActionButton, pageContainerStyles } from "@frontend/gameplay/shared/components";
import { useAiStatus, useTriggerAiMove } from "@frontend/ai/api";
import { usePlayersQuery } from "../game-data/queries";
import type { GameData } from "@frontend/shared-types";
import styles from "./device-handoff-overlay.module.css";

/**
 * Handoff-style overlay shown when it's the AI's turn.
 * User presses EXECUTE to trigger the AI move, then the overlay closes
 * and the header switches to "AI IS THINKING..." mode.
 */

const EASE = [0.4, 0, 0.2, 1] as const;

interface AiTurnOverlayProps {
  gameData: GameData;
}

export const AiTurnOverlay: React.FC<AiTurnOverlayProps> = ({ gameData }) => {
  const { data: aiStatus } = useAiStatus(gameData.publicId);
  const { data: players } = usePlayersQuery(gameData.publicId);
  const triggerMove = useTriggerAiMove(gameData.publicId);

  // Local visibility — dismissed immediately on EXECUTE, resets when available flips true again
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (aiStatus?.available) setVisible(true);
  }, [aiStatus?.available]);

  const activePlayer = players?.find((p) => p.status === "ACTIVE");
  const teamConfig = activePlayer ? getTeamConfig(activePlayer.teamName) : null;
  const isSpymaster = activePlayer?.role === "CODEMASTER";

  const handleExecute = () => {
    triggerMove.mutate();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
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

            <ActionButton
              text="EXECUTE"
              onClick={handleExecute}
              enabled={!triggerMove.isPending}
              fullWidth
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
