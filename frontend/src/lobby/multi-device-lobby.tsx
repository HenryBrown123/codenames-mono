import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby-page.module.css";
import {
  useLobbyQuery,
  useAddPlayer,
  useMovePlayerToTeam,
  useStartGame,
  type LobbyPlayer,
} from "@frontend/lobby/api";
import { useCurrentUser } from "@frontend/lib/auth/use-current-user";
import { TeamSymbol } from "./team-symbol";

interface MultiDeviceLobbyProps {
  gameId: string;
}

// Animation timing constants
const TIMINGS = {
  BOX_ENTER: 0.3,
  BOX_EXIT: 0.2,
  CONTENT_FADE: 0.2,
  TEAM_SWITCH: 0.3, // Used for symbol transitions and border color changes
  CONTENT_DELAY_SHORT: 0.05,
  CONTENT_DELAY_MEDIUM: 0.1,
} as const;

const EASING = [0.4, 0, 0.2, 1] as const;

const boxVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: TIMINGS.BOX_ENTER, ease: EASING },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: TIMINGS.BOX_EXIT, ease: EASING },
  },
};

const dotVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMINGS.BOX_EXIT, ease: EASING },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: TIMINGS.BOX_EXIT, ease: EASING },
  },
};

/**
 * Multi-device lobby interface
 * Each user joins with one player
 */
export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [inputPlayerName, setInputPlayerName] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const { data: currentUser } = useCurrentUser();
  const addPlayerMutation = useAddPlayer(gameId);
  const movePlayerMutation = useMovePlayerToTeam(gameId);
  const startGameMutation = useStartGame(gameId);

  const isLoading =
    addPlayerMutation.isPending || movePlayerMutation.isPending || startGameMutation.isPending;

  const error =
    queryError?.message ||
    addPlayerMutation.error?.message ||
    movePlayerMutation.error?.message ||
    startGameMutation.error?.message;

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

  // Derive hasJoined from playerContext (server already knows if user has joined)
  const hasJoined = !!lobbyData?.playerContext;
  const myPlayerName = lobbyData?.playerContext?.playerName;
  const myTeamName = lobbyData?.playerContext?.teamName;

  const teamColors = {
    "Team Red": "var(--color-team-red, #ff0040)",
    "Team Blue": "var(--color-team-blue, #00d4ff)",
  };

  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2);

  const handleJoinTeam = (teamName: string) => {
    if (!inputPlayerName.trim() || hasJoined) return;

    addPlayerMutation.mutate({ playerName: inputPlayerName, teamName });
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

  const handleTeamToggle = () => {
    if (!lobbyData?.playerContext) return;

    const newTeamName = myTeamName === "Team Red" ? "Team Blue" : "Team Red";

    movePlayerMutation.mutate({
      playerId: lobbyData.playerContext.publicId,
      newTeamName,
    });
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
        {/* Your team box (if joined) */}
        {hasJoined && myTeamName && myPlayerName && (
          <motion.div
            layoutId="player-control-container"
            className={styles.myTeamBox}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              borderColor: teamColors[myTeamName as keyof typeof teamColors],
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: TIMINGS.BOX_ENTER,
              ease: EASING,
              borderColor: { duration: TIMINGS.TEAM_SWITCH, ease: EASING }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`team-content-${myTeamName}`}
                style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMINGS.TEAM_SWITCH, ease: EASING }}
              >
                <TeamSymbol
                  teamName={myTeamName as "Team Red" | "Team Blue"}
                  teamColor={teamColors[myTeamName as keyof typeof teamColors]}
                  className={styles.bigTeamSymbol}
                />
                <div className={styles.teamInfoSection}>
                  <div
                    className={styles.teamName}
                    style={{ color: teamColors[myTeamName as keyof typeof teamColors] }}
                  >
                    {myTeamName === "Team Red" ? "TEAM RED" : "TEAM BLUE"}
                  </div>
                  <div className={styles.playerLabel}>{myPlayerName}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key="status-section"
                className={styles.statusSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMINGS.CONTENT_FADE, delay: TIMINGS.CONTENT_DELAY_SHORT, ease: EASING }}
              >
                <div className={styles.waitingMessage}>Waiting for other players to join...</div>
                <div className={styles.playerCount} key={totalPlayers}>
                  {Math.max(0, 4 - totalPlayers)} more players required
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`switch-button-${myTeamName}`}
                className={styles.switchButtonContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TIMINGS.TEAM_SWITCH, delay: TIMINGS.CONTENT_DELAY_MEDIUM, ease: EASING }}
              >
                <TeamSymbol
                  teamName={
                    (myTeamName === "Team Red" ? "Team Blue" : "Team Red") as "Team Red" | "Team Blue"
                  }
                  teamColor={
                    teamColors[
                      (myTeamName === "Team Red"
                        ? "Team Blue"
                        : "Team Red") as keyof typeof teamColors
                    ]
                  }
                  className={styles.switchSymbol}
                  onClick={handleTeamToggle}
                  isButton={true}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Header for non-joined users */}
        {!hasJoined && (
          <div className={styles.header}>
            <h1 className={styles.title}>OPERATIVE CONTROL - MULTI-DEVICE</h1>
            <div className={styles.gameInfo}>
              Game ID: {lobbyData.publicId} | {totalPlayers} Players
            </div>
          </div>
        )}

        {/* Join Area (if not joined yet) */}
        {!hasJoined && (
          <motion.div
            layoutId="player-control-container"
            className={styles.joinArea}
            variants={boxVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="join-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                <h2 className={styles.joinTitle}>Join the Mission</h2>
                <input
                  className={styles.addInput}
                  placeholder="Enter your operative name..."
                  value={inputPlayerName}
                  onChange={(e) => setInputPlayerName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />

                <div className={styles.teamButtonsGrid}>
                  <motion.button
                    className={styles.joinTeamButton}
                    style={{ "--team-color": teamColors["Team Red"] } as React.CSSProperties}
                    onClick={() => handleJoinTeam("Team Red")}
                    disabled={isLoading || !inputPlayerName.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    JOIN TEAM RED
                  </motion.button>
                  <motion.button
                    className={styles.joinTeamButton}
                    style={{ "--team-color": teamColors["Team Blue"] } as React.CSSProperties}
                    onClick={() => handleJoinTeam("Team Blue")}
                    disabled={isLoading || !inputPlayerName.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    JOIN TEAM BLUE
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
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
                  <div className={styles.playerCount}>{team.players?.length ?? 0}/6 operatives</div>
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
