import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./lobby.module.css";
import { useLobbyMutations, type LobbyPlayer, type LobbyData } from "@frontend/lobby/api";
import {
  LobbyHeaderView,
  StartButtonView,
  TeamsGridView,
  TeamsGridMobileView,
  TeamTileView,
  PlayerTileView,
  AddPlayerInputView,
} from "./components";

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
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const TEAM_COLORS = {
  "Team Red": "var(--color-team-red, #ff0040)",
  "Team Blue": "var(--color-team-blue, #00d4ff)",
};

export const SingleDeviceLobby: React.FC<SingleDeviceLobbyProps> = ({ gameId, lobbyData }) => {
  const navigate = useNavigate();
  const [activeTeam, setActiveTeam] = useState<"Team Red" | "Team Blue">("Team Red");
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [teamRedInput, setTeamRedInput] = useState("");
  const [teamBlueInput, setTeamBlueInput] = useState("");
  const [draggedPlayer, setDraggedPlayer] = useState<{
    player: LobbyPlayer;
    fromTeam: string;
  } | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null);

  const { ops, isPending: isLoading, error } = useLobbyMutations(gameId);

  // Derived state
  const totalPlayers =
    lobbyData.teams?.reduce((sum, team) => sum + (team.players?.length ?? 0), 0) ?? 0;
  const canStartGame =
    lobbyData.aiMode ||
    (totalPlayers >= 4 && lobbyData.teams?.every((team) => (team.players?.length ?? 0) >= 2));

  // Handlers
  const handleQuickAdd = (teamName: string) => {
    const playerName = teamName === "Team Red" ? teamRedInput.trim() : teamBlueInput.trim();
    if (!playerName) return;

    ops.addPlayer.mutate(
      { playerName, teamName },
      {
        onSuccess: () => {
          if (teamName === "Team Red") setTeamRedInput("");
          else setTeamBlueInput("");
        },
      },
    );
  };

  const handleRemovePlayer = (playerId: string) => {
    ops.removePlayer.mutate(playerId);
  };

  const handleEditPlayer = (player: LobbyPlayer) => {
    setEditingPlayer(player.publicId);
    setEditName(player.name);
  };

  const handleSaveEdit = () => {
    if (!editingPlayer || !editName.trim()) return;

    ops.renamePlayer.mutate(
      { playerId: editingPlayer, newPlayerName: editName.trim() },
      {
        onSuccess: () => {
          setEditingPlayer(null);
          setEditName("");
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditName("");
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    ops.startGame.mutate(undefined, {
      onSuccess: () => navigate(`/game/${gameId}`),
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, player: LobbyPlayer, fromTeam: string) => {
    setDraggedPlayer({ player, fromTeam });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, teamName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTeam(teamName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTeam(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toTeam: string) => {
    e.preventDefault();
    setDragOverTeam(null);

    if (!draggedPlayer || draggedPlayer.fromTeam === toTeam) {
      setDraggedPlayer(null);
      return;
    }

    ops.movePlayerToTeam.mutate(
      { playerId: draggedPlayer.player.publicId, newTeamName: toTeam },
      {
        onSettled: () => setDraggedPlayer(null),
      },
    );
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  };

  // Render helpers
  const renderTeamTile = (team: LobbyData["teams"][0]) => {
    const teamColor = TEAM_COLORS[team.name as keyof typeof TEAM_COLORS] ?? "#6b7280";
    const inputValue = team.name === "Team Red" ? teamRedInput : teamBlueInput;
    const setInputValue = team.name === "Team Red" ? setTeamRedInput : setTeamBlueInput;

    return (
      <TeamTileView
        key={team.name}
        teamName={team.name}
        teamColor={teamColor}
        playerCount={team.players?.length ?? 0}
        isDragOver={dragOverTeam === team.name}
        onDragOver={(e) => handleDragOver(e, team.name)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, team.name)}
        footer={
          <AddPlayerInputView
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleQuickAdd(team.name)}
            teamColor={teamColor}
            disabled={isLoading}
          />
        }
      >
        {team.players?.map((player) => (
          <PlayerTileView
            key={player.publicId}
            playerName={player.name}
            isDraggable
            isDragging={draggedPlayer?.player.publicId === player.publicId}
            isEditing={editingPlayer === player.publicId}
            editValue={editName}
            onEditChange={setEditName}
            onEditSave={handleSaveEdit}
            onEditCancel={handleCancelEdit}
            onEditStart={() => handleEditPlayer(player)}
            onRemove={() => handleRemovePlayer(player.publicId)}
            onDragStart={(e) => handleDragStart(e, player, team.name)}
            onDragEnd={handleDragEnd}
            disabled={isLoading}
          />
        ))}
      </TeamTileView>
    );
  };

  const teamsToRender = lobbyData.teams ?? [];
  const mobileFilteredTeams = teamsToRender.filter((team) => team.name === activeTeam);

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
    </div>
  );
};

export default SingleDeviceLobby;
