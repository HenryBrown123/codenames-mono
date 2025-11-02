import React, { useState } from "react";
import { useCreateGuestSession } from "@frontend/game-access/api/query-hooks/use-guest-session";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@frontend/gameplay/shared/components";
import styles from "./guest-auth-page-content.module.css";

/**
 * Guest authentication page - creates a guest session before game creation
 */
export const GuestAuthPageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { mutate: createGuestSession, isPending: isCreatingSession } = useCreateGuestSession();

  const navigate = useNavigate();

  const handleCreateSession = () => {
    setIsExiting(true);

    // Wait for exit animation to complete (1s) before actually creating session
    setTimeout(() => {
      createGuestSession(undefined, {
        onSuccess: () => {
          navigate("/create-game");
        },
        onError: () => {
          setIsExiting(false);
          setError("Failed to create a guest session. Please try again.");
        },
      });
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div key="page-content" exit={{ opacity: 1 }}>
            <AnimatePresence propagate>
              <motion.div
                className={styles.mainContent}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1] as const,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: [1, 0, 0] as const,
                  y: 0,
                  transition: {
                    duration: 1,
                    times: [0, 0.6, 1] as const,
                    ease: [0.4, 0, 0.2, 1] as const,
                  },
                }}
              >
                <div className={styles.header}>
                  <h1 className={styles.title}>SYSTEM ACCESS</h1>
                  <div className={styles.subtitle}>CODENAMES PROTOCOL v4.0</div>
                </div>

                <div className={styles.terminalBox}>
                  <div className={styles.terminalHeader}>
                    <span className={styles.terminalPrompt}>{">"}</span>
                    <span className={styles.terminalText}>AUTHENTICATION REQUIRED</span>
                  </div>

                  <div className={styles.messageBox}>
                    <p className={styles.message}>
                      Welcome, Operative. Before accessing the mission briefing, we need to
                      establish a secure guest session. This ensures your intel remains intact
                      throughout the operation.
                    </p>
                  </div>

                  <ActionButton
                    onClick={handleCreateSession}
                    enabled={!isExiting}
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
            </AnimatePresence>
            <motion.div
              key="exit-dot"
              className={styles.backgroundDot}
              initial={{ opacity: 0 }}
              exit={{
                opacity: 1,
                transition: {
                  duration: 1,
                  ease: [0, 1, 1, 1] as const,
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestAuthPageContent;
