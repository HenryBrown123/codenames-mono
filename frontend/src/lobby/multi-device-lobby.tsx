import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import api from "@frontend/api";
import { useLobbyQuery, useLobbyMutations } from "@frontend/lobby/api";
import { useCurrentUser } from "@frontend/auth/use-current-user";
import { useDragState } from "./hooks";
import {
  LobbyHeaderView,
  StartButtonView,
  TeamsGridView,
  TeamsGridMobileView,
  TeamTileView,
  PlayerTileView,
  JoinAreaView,
} from "./components";

interface MultiDeviceLobbyProps {
  gameId: string;
  onStart: () => void;
}

export const MultiDeviceLobby: React.FC<MultiDeviceLobbyProps> = ({ gameId, onStart }) => {
  const [inputPlayerName, setInputPlayerName] = useState("");

  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const { data: currentUser } = useCurrentUser();
  const { ops, isPending: isLoading, error: mutationError } = useLobbyMutations(gameId);
  const drag = useDragState();

  const error = queryError?.message || mutationError;

  if (initialLoading || !lobbyData) {
    return null;
  }

  const hasJoined = !!lobbyData?.playerContext;

  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    lobbyData.aiMode ||
    (totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2));

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
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleDrop = (e: React.DragEvent, toTeam: string) => {
    const result = drag.onDrop(e, toTeam);
    if (!result) return;
    ops.movePlayerToTeam.mutate(
      { playerId: result.player.publicId, newTeamName: result.toTeam },
      { onSettled: () => drag.reset() },
    );
  };

  const teamTiles = lobbyData.teams?.map((team) => (
    <TeamTileView
      key={team.name}
      teamName={team.name}
      playerCount={team.players?.length ?? 0}
      emptyMessage="<EMPTY>"
      isDragOver={drag.isDragOver(team.name)}
      onDragOver={(e) => drag.onDragOver(e, team.name)}
      onDragLeave={drag.onDragLeave}
      onDrop={(e) => handleDrop(e, team.name)}
    >
      {team.players?.map((player) => {
        const isMyPlayer = currentUser?.userId === player.userId;
        return (
          <PlayerTileView
            key={player.publicId}
            playerName={player.name}
            isCurrentUser={isMyPlayer}
            isDraggable={isMyPlayer && !isLoading}
            isDragging={drag.isDragging(player.publicId)}
            onDragStart={(e) => drag.onDragStart(e, player, team.name)}
            onDragEnd={drag.onDragEnd}
          />
        );
      })}
    </TeamTileView>
  ));

  return (
    <div className={styles.lobbyCard}>
      <LobbyHeaderView
        title="OPERATION LOBBY"
        gameId={lobbyData.publicId}
        playerCount={totalPlayers}
      />

      {!hasJoined && (
        <AnimatePresence mode="wait">
          <motion.div
            key="join-content"
            className={styles.joinArea}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } }}
          >
            <JoinAreaView
              playerName={inputPlayerName}
              onPlayerNameChange={setInputPlayerName}
              onJoinRed={() => handleJoinTeam("Team Red")}
              onJoinBlue={() => handleJoinTeam("Team Blue")}
              disabled={isLoading}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <TeamsGridView>{teamTiles}</TeamsGridView>
      <TeamsGridMobileView>{teamTiles}</TeamsGridMobileView>

      <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default MultiDeviceLobby;
