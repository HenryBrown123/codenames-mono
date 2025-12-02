import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import { useLobbyQuery, useLobbyMutations } from "@frontend/lobby/api";
import { useCurrentUser } from "@frontend/lib/auth/use-current-user";
import {
  LobbyHeaderView,
  StartButtonView,
  TeamsGridView,
  TeamTileView,
  PlayerTileView,
  JoinAreaView,
  MyTeamBoxView,
} from "./components";

//todo: sort out hardcoded naviagtion URLs

// ============================================================================
// TYPES
// ============================================================================

interface MultiDeviceLobbyProps {
  gameId: string;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const boxVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
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

// ============================================================================
// CONSTANTS
// ============================================================================

const TEAM_COLORS = {
  "Team Red": "var(--color-team-red, #ff0040)",
  "Team Blue": "var(--color-team-blue, #00d4ff)",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [inputPlayerName, setInputPlayerName] = useState("");

  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const { data: currentUser } = useCurrentUser();
  const { ops, isPending: isLoading, error: mutationError } = useLobbyMutations(gameId);

  const error = queryError?.message || mutationError;

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

  const hasJoined = !!lobbyData?.playerContext;
  const myPlayerName = lobbyData?.playerContext?.playerName;
  // todo: implement better typing for teams! this needs sorting...
  const myTeamName = lobbyData?.playerContext?.teamName as "Team Red" | "Team Blue" | undefined;

  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    lobbyData.aiMode ||
    (totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2));
  const playersNeeded = Math.max(0, 4 - totalPlayers);

  const handleJoinTeam = (teamName: string) => {
    if (!inputPlayerName.trim() || hasJoined) return;
    ops.addPlayer.mutate({ playerName: inputPlayerName, teamName });
  };

  const handleStartGame = () => {
    if (!canStartGame) return;
    ops.startGame.mutate(undefined, {
      onSuccess: () => navigate(`/game/${gameId}`),
    });
  };

  const handleTeamToggle = () => {
    if (!lobbyData?.playerContext) return;
    const newTeamName = myTeamName === "Team Red" ? "Team Blue" : "Team Red";
    ops.movePlayerToTeam.mutate({
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
        <LobbyHeaderView
          title="OPERATION LOBBY"
          gameId={lobbyData.publicId}
          playerCount={totalPlayers}
        />

        {/* Your team box (if joined) */}
        {hasJoined && myTeamName && myPlayerName && (
          <MyTeamBoxView
            teamName={myTeamName}
            playerName={myPlayerName}
            playersNeeded={playersNeeded}
            onSwitchTeam={handleTeamToggle}
            disabled={isLoading}
          />
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
            <JoinAreaView
              playerName={inputPlayerName}
              onPlayerNameChange={setInputPlayerName}
              onJoinRed={() => handleJoinTeam("Team Red")}
              onJoinBlue={() => handleJoinTeam("Team Blue")}
              disabled={isLoading}
            />
          </motion.div>
        )}

        {/* Teams Display */}
        <TeamsGridView>
          {lobbyData.teams?.map((team) => {
            const teamColor = TEAM_COLORS[team.name as keyof typeof TEAM_COLORS] ?? "#6b7280";
            return (
              <TeamTileView
                key={team.name}
                teamName={team.name}
                teamColor={teamColor}
                playerCount={team.players?.length ?? 0}
                emptyMessage="No operatives yet..."
              >
                {team.players?.map((player) => (
                  <PlayerTileView
                    key={player.publicId}
                    playerName={player.name}
                    isCurrentUser={currentUser?.userId === player.userId}
                  />
                ))}
              </TeamTileView>
            );
          })}
        </TeamsGridView>

        <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

        {error && <div className={styles.errorMessage}>{error}</div>}
      </motion.div>
    </div>
  );
};

export default MultiDeviceLobby;
