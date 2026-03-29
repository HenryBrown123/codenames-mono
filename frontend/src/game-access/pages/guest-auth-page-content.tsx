import React, { useState } from "react";
import { useCreateGuestSession } from "@frontend/game-access/api/query-hooks/use-guest-session";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton, AwaitingLabel, ErrorBox, PageContainer, pageContainerStyles } from "@frontend/gameplay/shared/components";
import styles from "./guest-auth-page-content.module.css";

/**
 * Guest authentication — minimal, clean.
 * Styled to match the in-game intel panel aesthetic.
 */

export interface GuestAuthPageViewProps {
  isExiting: boolean;
  error: string | null;
  onCreateSession: () => void;
}

export const GuestAuthPageView: React.FC<GuestAuthPageViewProps> = ({
  isExiting,
  error,
  onCreateSession,
}) => (
  <PageContainer>
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div key="page-content" exit={{ opacity: 1 }}>
          <AnimatePresence propagate>
            <motion.div
              className={pageContainerStyles.card}
              style={{ maxWidth: 480 }}
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
              </div>

              <div className={styles.body}>
                <div className={styles.controlRow}>
                  <AwaitingLabel>SECURE CONNECTION REQUIRED</AwaitingLabel>
                </div>

                <div className={styles.controlRow}>
                  <ActionButton
                    text="CONNECT"
                    onClick={onCreateSession}
                    enabled={!isExiting}
                    className={styles.fullWidthBtn}
                  />
                </div>

                {error && <ErrorBox message={error} />}
              </div>
            </motion.div>
          </AnimatePresence>
          <motion.div
            key="exit-dot"
            className={pageContainerStyles.backgroundDot}
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
  </PageContainer>
);

export const GuestAuthPageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { mutate: createGuestSession } = useCreateGuestSession();
  const navigate = useNavigate();

  const handleCreateSession = () => {
    setIsExiting(true);

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
    <GuestAuthPageView
      isExiting={isExiting}
      error={error}
      onCreateSession={handleCreateSession}
    />
  );
};

export default GuestAuthPageContent;
