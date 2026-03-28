import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import api from "@frontend/api";
import { useLobbyQuery, useLobbyMutations } from "@frontend/lobby/api";
import { useCurrentUser } from "@frontend/auth/use-current-user";
import {
  LobbyHeaderView,
  StartButtonView,
  TeamsGridView,
  TeamsGridMobileView,
  TeamTileView,
  PlayerTileView,
  JoinAreaView,
  MyTeamBoxView,
} from "./components";

/**
 * Lobby for multi-device play with join controls
 */

interface MultiDeviceLobbyProps {
  gameId: string;
}

const boxVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  shrinkToDot: {
    opacity: 0,
    scale: 0,
    borderRadius: "50%",
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
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

export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [inputPlayerName, setInputPlayerName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartGame = async () => {
    if (!canStartGame) return;
    setIsStarting(true);
    try {
      // 1. Start the game (sets status to IN_PROGRESS)
      await ops.startGame.mutateAsync(undefined);
      // 2. Create round (backend deals cards + assigns roles in one transaction)
      await api.post(`/games/${gameId}/rounds`);
      // 3. Navigate — player sees dealt cards with START ROUND / REDEAL
      setTimeout(() => navigate(`/game/${gameId}`, { state: { fromLobby: true } }), 800);
    } catch (error) {
      console.error("Failed to start game:", error);
      setIsStarting(false);
    }
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
      <AnimatePresence mode="wait">
        {isStarting ? (
          <motion.div
            key="loading-dot"
            className={styles.loadingDot}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        ) : (
      <motion.div
        key="lobby-content"
        className={styles.mainContent}
        variants={boxVariants}
        initial="initial"
        animate="animate"
        exit="shrinkToDot"
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
            aiMode={lobbyData.aiMode}
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

        {/* Teams Display — desktop grid + mobile stacked */}
        {(() => {
          const teamTiles = lobbyData.teams?.map((team) => (
            <TeamTileView
              key={team.name}
              teamName={team.name}
              playerCount={team.players?.length ?? 0}
              emptyMessage="<EMPTY>"
            >
              {team.players?.map((player) => (
                <PlayerTileView
                  key={player.publicId}
                  playerName={player.name}
                  isCurrentUser={currentUser?.userId === player.userId}
                />
              ))}
            </TeamTileView>
          ));
          return (
            <>
              <TeamsGridView>{teamTiles}</TeamsGridView>
              <TeamsGridMobileView>{teamTiles}</TeamsGridMobileView>
            </>
          );
        })()}

        <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

        {error && <div className={styles.errorMessage}>{error}</div>}
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiDeviceLobby;
