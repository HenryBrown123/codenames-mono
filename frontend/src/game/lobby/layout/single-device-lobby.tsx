import React, { useState } from "react";
import styles from "./lobby.module.css";
import { useLobbyMutations, type LobbyData } from "@frontend/game/lobby/api";
import { getTeamConfig } from "@frontend/shared/types";
import { LobbyHeaderView } from "../shared/lobby-header";
import { StartButtonView } from "../shared/start-button";
import { TeamsGridView, TeamsGridMobileView } from "../teams/teams-grid";
import { TeamTileView } from "../teams/team-tile";
import { PlayerTileView } from "../teams/player-tile";
import { AddPlayerInputView } from "../teams/add-player-input";
import { useDragState } from "../teams/use-drag-state";
import { useEditingState } from "../teams/use-editing-state";
import { useTeamInputs } from "../teams/use-team-inputs";

interface SingleDeviceLobbyProps {
  gameId: string;
  lobbyData: LobbyData;
  onStart: () => void;
}

export const SingleDeviceLobby: React.FC<SingleDeviceLobbyProps> = ({
  gameId,
  lobbyData,
  onStart,
}) => {
  const [activeTeam, setActiveTeam] = useState<"Team Red" | "Team Blue">("Team Red");

  const { ops, isPending: isLoading, error } = useLobbyMutations(gameId);
  const drag = useDragState();
  const editing = useEditingState();
  const teamInputs = useTeamInputs();

  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    lobbyData.aiMode ||
    (totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2));

  const handleQuickAdd = (teamName: string) => {
    const playerName = teamInputs.getInputValue(teamName);
    if (!playerName) return;
    ops.addPlayer.mutate(
      { playerName, teamName },
      { onSuccess: () => teamInputs.clearInput(teamName) },
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
      { onSuccess: () => editing.reset() },
    );
  };

  const handleStartGame = () => {
    if (!canStartGame) return;
    ops.startGame.mutate(undefined, {
      onSuccess: () => onStart(),
    });
  };

  const handleDrop = (e: React.DragEvent, toTeam: string) => {
    const result = drag.onDrop(e, toTeam);
    if (!result) return;
    ops.movePlayerToTeam.mutate(
      { playerId: result.player.publicId, newTeamName: result.toTeam },
      { onSettled: () => drag.reset() },
    );
  };

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
            idPrefix={`add-player-${team.name.toLowerCase().replace(/\s+/g, "-")}`}
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
    <div className={styles.lobbyCard}>
      <LobbyHeaderView
        title="OPERATIVE CONTROL"
        gameId={lobbyData.publicId}
        playerCount={totalPlayers}
      />

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

      <TeamsGridView>{teamsToRender.map(renderTeamTile)}</TeamsGridView>
      <TeamsGridMobileView>{mobileFilteredTeams.map(renderTeamTile)}</TeamsGridMobileView>

      <StartButtonView canStart={canStartGame} isLoading={isLoading} onClick={handleStartGame} />

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default SingleDeviceLobby;
