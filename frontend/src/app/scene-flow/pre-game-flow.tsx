import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateGuestSession } from "@frontend/game-access/api/query-hooks/use-guest-session";
import { useCreateNewGame } from "@frontend/game-access/api/query-hooks/use-create-new-game";
import { GuestAuthView } from "@frontend/game-access/pages/guest-auth-page-content";
import { CreateGameView } from "@frontend/game-access/pages/create-game-page-content";
import { LobbyScene } from "@frontend/lobby/lobby-scene";
import { SceneCard } from "./scene-card";
import styles from "./pre-game-flow.module.css";

type Step = "auth" | "setup" | "lobby";

const STEPS: Step[] = ["auth", "setup", "lobby"];

export const PreGameFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("auth");
  const [gameId, setGameId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error state per step
  const [error, setError] = useState<string | null>(null);

  // API hooks
  const { mutate: createGuestSession } = useCreateGuestSession();
  const { mutate: createNewGame } = useCreateNewGame();

  // Ref to hold the callback that runs after exit animation completes
  const onExitCompleteRef = useRef<(() => void) | null>(null);

  const advance = useCallback((afterExit?: () => void) => {
    onExitCompleteRef.current = afterExit ?? null;
    setExiting(true);
    setError(null);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (onExitCompleteRef.current) {
      onExitCompleteRef.current();
      onExitCompleteRef.current = null;
      return;
    }

    // Default: move to next step
    const nextIndex = STEPS.indexOf(step) + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
      setExiting(false);
    }
  }, [step]);

  const handleConnect = useCallback(() => {
    advance(() => {
      createGuestSession(undefined, {
        onSuccess: () => {
          setStep("setup");
          setExiting(false);
        },
        onError: () => {
          // Go back to auth with error
          setExiting(false);
          setError("Failed to create a guest session. Please try again.");
        },
      });
    });
  }, [advance, createGuestSession]);

  const handleGameCreated = useCallback(
    (gameType: string, gameFormat: string, aiMode: boolean) => {
      advance(() => {
        createNewGame(
          { gameType: gameType as any, gameFormat: gameFormat as any, aiMode },
          {
            onSuccess: (newGameData) => {
              setGameId(newGameData.publicId);
              setStep("lobby");
              setExiting(false);
            },
            onError: (err) => {
              console.error("Game creation error:", err);
              setExiting(false);
              setError("Failed to create a new game. Please try again.");
            },
          },
        );
      });
    },
    [advance, createNewGame],
  );

  const handleGameStart = useCallback(() => {
    // Lobby handles its own API calls (startGame + create round)
    // then calls this to exit the flow
    advance(() => {
      navigate(`/game/${gameId}`, { state: { fromLobby: true } });
    });
  }, [advance, navigate, gameId]);

  const handleLobbyLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  interface SceneConfig {
    maxWidth?: number;
    render: () => React.ReactNode;
  }

  const scenes: Record<Step, SceneConfig> = {
    auth: {
      maxWidth: 480,
      render: () => (
        <GuestAuthView
          onConnect={handleConnect}
          error={error}
        />
      ),
    },
    setup: {
      maxWidth: 700,
      render: () => (
        <CreateGameView
          onCreateGame={handleGameCreated}
          error={error}
        />
      ),
    },
    lobby: {
      maxWidth: 1400,
      render: () => (
        <LobbyScene
          gameId={gameId!}
          onStart={handleGameStart}
          onLoading={handleLobbyLoading}
        />
      ),
    },
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.backgroundDot}
        data-visible={exiting || loading}
      />
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {!exiting && (
          loading ? (
            <motion.div
              key="loading"
              className={styles.loadingDot}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
              }}
              exit={{
                opacity: 0,
                scale: 0,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
              }}
            />
          ) : (
            <SceneCard key={step} maxWidth={scenes[step].maxWidth}>
              {scenes[step].render()}
            </SceneCard>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
