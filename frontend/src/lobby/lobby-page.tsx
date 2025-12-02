import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import { useLobbyQuery } from "@frontend/lobby/api";
import { SingleDeviceLobby } from "./single-device-lobby";
import { MultiDeviceLobby } from "./multi-device-lobby";

// ============================================================================
// TYPES
// ============================================================================

interface LobbyPageProps {
  gameId: string;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const dotVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Lobby page entry point - loads data and picks the appropriate lobby mode
 */
export const LobbyInterface: React.FC<LobbyPageProps> = ({ gameId }) => {
  const { data: lobbyData, isLoading } = useLobbyQuery(gameId);

  if (isLoading || !lobbyData) {
    return (
      <div className={styles.container}>
        <AnimatePresence mode="wait">
          <motion.div
            key="loading"
            className={styles.loadingDot}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        </AnimatePresence>
      </div>
    );
  }
  if (lobbyData.gameType === "MULTI_DEVICE") {
    return <MultiDeviceLobby gameId={gameId} />;
  }

  return <SingleDeviceLobby gameId={gameId} lobbyData={lobbyData} />;
};

export default LobbyInterface;
