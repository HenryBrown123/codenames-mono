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
            layout
            className={styles.myTeamBox}
            style={
              {
                "--team-color": teamColors[myTeamName as keyof typeof teamColors],
              } as React.CSSProperties
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div layout style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <TeamSymbol
                teamName={myTeamName as "Team Red" | "Team Blue"}
                teamColor={teamColors[myTeamName as keyof typeof teamColors]}
                className={styles.bigTeamSymbol}
              />
              <motion.div layout className={styles.teamInfoSection}>
                <motion.div
                  layout
                  layoutId="team-name"
                  className={styles.teamName}
                  key={`team-${myTeamName}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {myTeamName === "Team Red" ? "TEAM RED" : "TEAM BLUE"}
                </motion.div>
                <motion.div
                  layout
                  layoutId="player-name"
                  className={styles.playerLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {myPlayerName}
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div layout className={styles.statusSection}>
              <motion.div
                layout
                className={styles.waitingMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                Waiting for other players to join...
              </motion.div>
              <motion.div
                layout
                className={styles.playerCount}
                key={totalPlayers}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {totalPlayers} / 4 players minimum
              </motion.div>
            </motion.div>

            <div className={styles.switchButtonContainer}>
              <TeamSymbol
                teamName={(myTeamName === "Team Red" ? "Team Blue" : "Team Red") as "Team Red" | "Team Blue"}
                teamColor={
                  teamColors[
                    (myTeamName === "Team Red" ? "Team Blue" : "Team Red") as keyof typeof teamColors
                  ]
                }
                className={styles.switchSymbol}
                onClick={handleTeamToggle}
                isButton={true}
              />
            </div>
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
          <div className={styles.joinArea}>
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
              <button
                className={styles.joinTeamButton}
                style={{ "--team-color": teamColors["Team Red"] } as React.CSSProperties}
                onClick={() => handleJoinTeam("Team Red")}
                disabled={isLoading || !inputPlayerName.trim()}
              >
                JOIN TEAM RED
              </button>
              <button
                className={styles.joinTeamButton}
                style={{ "--team-color": teamColors["Team Blue"] } as React.CSSProperties}
                onClick={() => handleJoinTeam("Team Blue")}
                disabled={isLoading || !inputPlayerName.trim()}
              >
                JOIN TEAM BLUE
              </button>
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
