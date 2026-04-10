import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import api from "@frontend/shared/api/api";
import { useLobbyQuery, useLobbyMutations } from "@frontend/game/lobby/api";
import { useCurrentUser } from "@frontend/shared/hooks/use-current-user";
import { useDragState } from "../teams/use-drag-state";
import { LobbyHeaderView } from "../shared/lobby-header";
import { StartButtonView } from "../shared/start-button";
import { TeamsGridView, TeamsGridMobileView } from "../teams/teams-grid";
import { TeamTileView } from "../teams/team-tile";
import { PlayerTileView } from "../teams/player-tile";
import { JoinAreaView } from "../teams/join-area";
import { MyTeamBoxView } from "../teams/my-team-box";
import { getOppositeTeam, type TeamName } from "@frontend/shared/types";

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

      <AnimatePresence mode="wait">
        {!hasJoined ? (
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
        ) : (
          <MyTeamBoxView
            key="my-team-box"
            teamName={lobbyData.playerContext!.teamName as TeamName}
            playerName={lobbyData.playerContext!.playerName}
            playersNeeded={(() => {
              const myTeam = lobbyData.teams?.find(t => t.name === lobbyData.playerContext!.teamName);
              return Math.max(0, 2 - (myTeam?.players?.length ?? 0));
            })()}
            disabled={isLoading}
            aiMode={lobbyData.aiMode}
            onSwitchTeam={() => {
              const opposite = getOppositeTeam(lobbyData.playerContext!.teamName as TeamName);
              if (opposite) {
                ops.movePlayerToTeam.mutate({
                  playerId: lobbyData.playerContext!.publicId,
                  newTeamName: opposite,
                });
              }
            }}
          />
        )}
      </AnimatePresence>

      <TeamsGridView>{teamTiles}</TeamsGridView>
      <TeamsGridMobileView>{teamTiles}</TeamsGridMobileView>

      <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default MultiDeviceLobby;
