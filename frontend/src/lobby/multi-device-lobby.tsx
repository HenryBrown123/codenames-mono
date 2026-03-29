import React, { useState } from "react";
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

interface MultiDeviceLobbyProps {
  gameId: string;
  onStart: () => void;
}

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

export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId, onStart }) => {
  const [inputPlayerName, setInputPlayerName] = useState("");

  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const { data: currentUser } = useCurrentUser();
  const { ops, isPending: isLoading, error: mutationError } = useLobbyMutations(gameId);

  const error = queryError?.message || mutationError;

  if (initialLoading || !lobbyData) {
    return null;
  }

  const hasJoined = !!lobbyData?.playerContext;
  const myPlayerName = lobbyData?.playerContext?.playerName;
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
    try {
      await ops.startGame.mutateAsync(undefined);
      await api.post(`/games/${gameId}/rounds`);
      onStart();
    } catch (error) {
      console.error("Failed to start game:", error);
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
    <div className={styles.lobbyCard}>
      <LobbyHeaderView
        title="OPERATION LOBBY"
        gameId={lobbyData.publicId}
        playerCount={totalPlayers}
      />

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
    </div>
  );
};

export default MultiDeviceLobby;
