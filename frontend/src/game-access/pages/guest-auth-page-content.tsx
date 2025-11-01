import React, { useState } from "react";
import { useCreateGuestSession } from "@frontend/game-access/api/query-hooks/use-guest-session";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@frontend/gameplay/shared/components";
import styles from "./guest-auth-page-content.module.css";

const boxVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const dotVariants = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Guest authentication page - creates a guest session before game creation
 */
export const GuestAuthPageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: createGuestSession, isPending: isCreatingSession } =
    useCreateGuestSession();

  const navigate = useNavigate();

  const handleCreateSession = () => {
    createGuestSession(undefined, {
      onSuccess: () => {
        navigate("/create-game");
      },
      onError: () => {
        setError("Failed to create a guest session. Please try again.");
      },
    });
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {isCreatingSession ? (
          <motion.div
            key="loading"
            className={styles.loadingDot}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        ) : (
          <motion.div
            key="content"
            className={styles.mainContent}
            variants={boxVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={styles.header}>
              <h1 className={styles.title}>SYSTEM ACCESS</h1>
              <div className={styles.subtitle}>CODENAMES PROTOCOL v4.0</div>
            </div>

            <div className={styles.terminalBox}>
              <div className={styles.terminalHeader}>
                <span className={styles.terminalPrompt}>{'>'}</span>
                <span className={styles.terminalText}>AUTHENTICATION REQUIRED</span>
              </div>

              <div className={styles.messageBox}>
                <p className={styles.message}>
                  Welcome, Operative. Before accessing the mission briefing, we need to establish a
                  secure guest session. This ensures your intel remains intact throughout the operation.
                </p>
              </div>

              <ActionButton
                onClick={handleCreateSession}
                enabled={!isCreatingSession}
                text="ESTABLISH CONNECTION"
              />

              {error && (
                <div className={styles.errorBox}>
                  <span className={styles.errorPrompt}>ERROR:</span>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestAuthPageContent;
