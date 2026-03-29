import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@frontend/gameplay/shared/components";
import styles from "./lobby.module.css";
import { useLobbyQuery } from "@frontend/lobby/api";
import { SingleDeviceLobby } from "./single-device-lobby";
import { MultiDeviceLobby } from "./multi-device-lobby";

/**
 * Lobby page routing between single and multi-device modes
 */

interface LobbyPageProps {
  gameId: string;
}

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

export const LobbyInterface: React.FC<LobbyPageProps> = ({ gameId }) => {
  const { data: lobbyData, isLoading } = useLobbyQuery(gameId);

  if (isLoading || !lobbyData) {
    return (
      <PageContainer>
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
      </PageContainer>
    );
  }
  if (lobbyData.gameType === "MULTI_DEVICE") {
    return <MultiDeviceLobby gameId={gameId} />;
  }

  return <SingleDeviceLobby gameId={gameId} lobbyData={lobbyData} />;
};

export default LobbyInterface;
