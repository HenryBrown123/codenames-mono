import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby-page.module.css";
import {
  useLobbyQuery,
  useAddPlayer,
  useStartGame,
  type LobbyPlayer,
} from "@frontend/lobby/api";
import { useCurrentUser } from "@frontend/lib/auth/use-current-user";

interface MultiDeviceLobbyProps {
  gameId: string;
}

const boxVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

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

/**
 * Multi-device lobby interface
 * Each user joins with one player
 */
export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [myPlayerName, setMyPlayerName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [myPlayer, setMyPlayer] = useState<LobbyPlayer | null>(null);
  const [shareMessage, setShareMessage] = useState("");

  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const { data: currentUser } = useCurrentUser();
  const addPlayerMutation = useAddPlayer(gameId);
  const startGameMutation = useStartGame(gameId);

  const isLoading = addPlayerMutation.isPending || startGameMutation.isPending;

  const error =
    queryError?.message ||
    addPlayerMutation.error?.message ||
    startGameMutation.error?.message;

  // Check if current user already has a player
  useEffect(() => {
    if (lobbyData && currentUser) {
      const foundPlayer = lobbyData.teams
        .flatMap((t) => t.players)
        .find((p) => p.userId === currentUser.userId);

      if (foundPlayer) {
        setHasJoined(true);
        setMyPlayer(foundPlayer);
        setMyPlayerName(foundPlayer.name);
      }
    }
  }, [lobbyData, currentUser]);

  if (initialLoading || !lobbyData) {
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

  const teamColors = {
    "Team Red": "var(--color-team-red, #ff0040)",
    "Team Blue": "var(--color-team-blue, #00d4ff)",
  };

  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2);

  const handleJoinTeam = (teamName: string) => {
    if (!myPlayerName.trim() || hasJoined) return;

    addPlayerMutation.mutate(
      { playerName: myPlayerName, teamName },
      {
        onSuccess: () => {
          setHasJoined(true);
        },
      },
    );
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    startGameMutation.mutate(undefined, {
      onSuccess: () => {
        navigate(`/game/${gameId}`);
      },
    });
  };

  const handleCopyLink = () => {
    const gameUrl = `${window.location.origin}/lobby/${gameId}`;
    navigator.clipboard.writeText(gameUrl);
    setShareMessage("Link copied to clipboard!");
    setTimeout(() => setShareMessage(""), 3000);
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.mainContent}
        variants={boxVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className={styles.header}>
          <h1 className={styles.title}>OPERATIVE CONTROL - MULTI-DEVICE</h1>
          <div className={styles.gameInfo}>
            Game ID: {lobbyData.publicId} | {totalPlayers} Players
          </div>
        </div>

        {/* Join Area (if not joined yet) */}
        {!hasJoined && (
          <div className={styles.joinArea}>
            <h2 className={styles.joinTitle}>Join the Mission</h2>
            <input
              className={styles.addInput}
              placeholder="Enter your operative name..."
              value={myPlayerName}
              onChange={(e) => setMyPlayerName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />

            <div className={styles.teamButtonsGrid}>
              <button
                className={styles.joinTeamButton}
                style={{ "--team-color": teamColors["Team Red"] } as React.CSSProperties}
                onClick={() => handleJoinTeam("Team Red")}
                disabled={isLoading || !myPlayerName.trim()}
              >
                JOIN TEAM RED
              </button>
              <button
                className={styles.joinTeamButton}
                style={{ "--team-color": teamColors["Team Blue"] } as React.CSSProperties}
                onClick={() => handleJoinTeam("Team Blue")}
                disabled={isLoading || !myPlayerName.trim()}
              >
                JOIN TEAM BLUE
              </button>
            </div>
          </div>
        )}

        {/* Waiting Area (if joined) */}
        {hasJoined && (
          <div className={styles.waitingArea}>
            <div className={styles.youJoinedMessage}>
              ✓ You joined as <strong>{myPlayer?.name}</strong> on{" "}
              <strong>{myPlayer?.teamName}</strong>
            </div>

            <div className={styles.shareArea}>
              <button className={styles.copyLinkButton} onClick={handleCopyLink}>
                📋 Copy Invite Link
              </button>
              {shareMessage && <div className={styles.shareMessage}>{shareMessage}</div>}
            </div>

            <div className={styles.waitingMessage}>
              Waiting for other players to join...
              <div className={styles.playerCount}>{totalPlayers} / 4 players minimum</div>
            </div>
          </div>
        )}

        {/* Teams Display */}
        <div className={styles.teamsGrid}>
          {lobbyData.teams?.map((team) => {
            const teamColor = teamColors[team.name as keyof typeof teamColors] ?? "#6b7280";
            return (
              <div
                key={team.name}
                className={styles.teamTile}
                style={{ "--team-color": teamColor } as React.CSSProperties}
              >
                <div className={styles.teamHeader}>
                  <h2
                    className={styles.teamName}
                    style={{ "--team-color": teamColor } as React.CSSProperties}
                  >
                    {team.name === "Team Red" ? "TEAM RED OPERATIVES" : "TEAM BLUE OPERATIVES"}
                  </h2>
                  <div className={styles.playerCount}>
                    {team.players?.length ?? 0}/6 operatives
                  </div>
                </div>

                <div className={styles.playersContainer}>
                  {team.players?.map((player) => (
                    <div key={player.publicId} className={styles.playerTile}>
                      <span className={styles.playerName}>{player.name}</span>
                      {currentUser && player.userId === currentUser.userId && (
                        <span className={styles.youBadge}>(You)</span>
                      )}
                    </div>
                  ))}

                  {team.players.length === 0 && (
                    <div className={styles.emptyTeamMessage}>No operatives yet...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <button
          className={styles.startButton}
          data-can-start={canStartGame}
          onClick={handleStartGame}
          disabled={!canStartGame || isLoading}
        >
          START MISSION
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </motion.div>
    </div>
  );
};

export default MultiDeviceLobby;
