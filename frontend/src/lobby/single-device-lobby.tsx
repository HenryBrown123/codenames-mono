import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer, pageContainerStyles } from "@frontend/gameplay/shared/components";
import styles from "./lobby.module.css";
import { useLobbyMutations, type LobbyData } from "@frontend/lobby/api";
import { getTeamConfig } from "@frontend/shared-types";
import {
  LobbyHeaderView,
  StartButtonView,
  TeamsGridView,
  TeamsGridMobileView,
  TeamTileView,
  PlayerTileView,
  AddPlayerInputView,
} from "./components";
import { useDragState, useEditingState, useTeamInputs } from "./hooks";

/**
 * Lobby for single-device play with drag-drop team management
 */

interface SingleDeviceLobbyProps {
  gameId: string;
  lobbyData: LobbyData;
}

const boxVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
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
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export const SingleDeviceLobby: React.FC<SingleDeviceLobbyProps> = ({ gameId, lobbyData }) => {
  const navigate = useNavigate();
  const [activeTeam, setActiveTeam] = useState<"Team Red" | "Team Blue">("Team Red");
  const [isStarting, setIsStarting] = useState(false);

  const { ops, isPending: isLoading, error } = useLobbyMutations(gameId);
  const drag = useDragState();
  const editing = useEditingState();
  const teamInputs = useTeamInputs();

  // Derived state
  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    lobbyData.aiMode ||
    (totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2));

  // Handlers
  const handleQuickAdd = (teamName: string) => {
    const playerName = teamInputs.getInputValue(teamName);
    if (!playerName) return;

    ops.addPlayer.mutate(
      { playerName, teamName },
      {
        onSuccess: () => teamInputs.clearInput(teamName),
      },
    );
  };

  const handleRemovePlayer = (playerId: string) => {
    ops.removePlayer.mutate(playerId);
  };

  const handleSaveEdit = () => {
    const payload = editing.getEditPayload();
    if (!payload) return;

    ops.renamePlayer.mutate(
      { playerId: payload.playerId, newPlayerName: payload.newName },
      {
        onSuccess: () => editing.reset(),
      },
    );
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    ops.startGame.mutate(undefined, {
      onSuccess: () => {
        setIsStarting(true);
        // Navigate after shrink-to-dot animation completes
        setTimeout(() => navigate(`/game/${gameId}`), 500);
      },
    });
  };

  const handleDrop = (e: React.DragEvent, toTeam: string) => {
    const result = drag.onDrop(e, toTeam);
    if (!result) return;

    ops.movePlayerToTeam.mutate(
      { playerId: result.player.publicId, newTeamName: result.toTeam },
      {
        onSettled: () => drag.reset(),
      },
    );
  };

  // Render helpers
  const renderTeamTile = (team: LobbyData["teams"][0]) => {
    const teamConfig = getTeamConfig(team.name);

    return (
      <TeamTileView
        key={team.name}
        teamName={team.name}
        playerCount={team.players?.length ?? 0}
        isDragOver={drag.isDragOver(team.name)}
        onDragOver={(e) => drag.onDragOver(e, team.name)}
        onDragLeave={drag.onDragLeave}
        onDrop={(e) => handleDrop(e, team.name)}
        footer={
          <AddPlayerInputView
            value={teamInputs.getValue(team.name)}
            onChange={(value) => teamInputs.setValue(team.name, value)}
            onSubmit={() => handleQuickAdd(team.name)}
            teamColor={teamConfig.cssVar}
            disabled={isLoading}
          />
        }
      >
        {team.players?.map((player) => (
          <PlayerTileView
            key={player.publicId}
            playerName={player.name}
            interactive
            isDraggable
            isDragging={drag.isDragging(player.publicId)}
            isEditing={editing.isEditing(player.publicId)}
            editValue={editing.editValue}
            onEditChange={editing.setEditValue}
            onEditSave={handleSaveEdit}
            onEditCancel={editing.cancelEdit}
            onEditStart={() => editing.startEdit(player)}
            onRemove={() => handleRemovePlayer(player.publicId)}
            onDragStart={(e) => drag.onDragStart(e, player, team.name)}
            onDragEnd={drag.onDragEnd}
            disabled={isLoading}
          />
        ))}
      </TeamTileView>
    );
  };

  const teamsToRender = lobbyData.teams ?? [];
  const mobileFilteredTeams = teamsToRender.filter((team) => team.name === activeTeam);

  return (
    <PageContainer>
      {isStarting && <div className={pageContainerStyles.backgroundDot} />}
      <AnimatePresence mode="wait">
        {isStarting ? (
          <motion.div
            key="loading-dot"
            className={styles.loadingDot}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } }}
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } }}
          />
        ) : (
      <motion.div
        key="lobby-content"
        className={`${pageContainerStyles.card} ${styles.lobbyCard}`}
        variants={boxVariants}
        initial="initial"
        animate="animate"
        exit="shrinkToDot"
      >
        <LobbyHeaderView
          title="OPERATIVE CONTROL"
          gameId={lobbyData.publicId}
          playerCount={totalPlayers}
        />

        {/* Mobile team switcher */}
        <div className={styles.teamSwitcher}>
          <button
            className={styles.teamSwitchButton}
            data-active={activeTeam === "Team Red"}
            onClick={() => setActiveTeam("Team Red")}
          >
            TEAM RED
          </button>
          <button
            className={styles.teamSwitchButton}
            data-active={activeTeam === "Team Blue"}
            onClick={() => setActiveTeam("Team Blue")}
          >
            TEAM BLUE
          </button>
        </div>

        {/* Desktop: Both teams */}
        <TeamsGridView>{teamsToRender.map(renderTeamTile)}</TeamsGridView>

        {/* Mobile: Active team only */}
        <TeamsGridMobileView>{mobileFilteredTeams.map(renderTeamTile)}</TeamsGridMobileView>

        <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

        {error && <div className={styles.errorMessage}>{error}</div>}
      </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default SingleDeviceLobby;
