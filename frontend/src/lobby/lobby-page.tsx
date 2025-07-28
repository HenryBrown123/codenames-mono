import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./lobby-page.module.css";
import {
  useLobbyQuery,
  useAddPlayer,
  useRemovePlayer,
  useRenamePlayer,
  useMovePlayerToTeam,
  useStartGame,
  type LobbyData,
  type LobbyPlayer,
} from "@frontend/lobby/api";

interface LobbyInterfaceProps {
  gameId: string;
}

// Mock data structure as fallback
const mockLobbyData: LobbyData = {
  publicId: "unknown",
  status: "LOBBY",
  gameType: "SINGLE_DEVICE",
  canModifyGame: true,
  teams: [
    {
      name: "Team Red",
      players: [],
    },
    {
      name: "Team Blue",
      players: [],
    },
  ],
};

/**
 * Lobby interface component with hacker-themed design
 */
export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [teamRedInput, setTeamRedInput] = useState("");
  const [teamBlueInput, setTeamBlueInput] = useState("");
  const [draggedPlayer, setDraggedPlayer] = useState<{
    player: LobbyPlayer;
    fromTeam: string;
  } | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null);

  // React Query hooks
  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const addPlayerMutation = useAddPlayer(gameId);
  const removePlayerMutation = useRemovePlayer(gameId);
  const renamePlayerMutation = useRenamePlayer(gameId);
  const movePlayerMutation = useMovePlayerToTeam(gameId);
  const startGameMutation = useStartGame(gameId);

  // Derived loading and error states
  const isLoading =
    addPlayerMutation.isPending ||
    removePlayerMutation.isPending ||
    renamePlayerMutation.isPending ||
    movePlayerMutation.isPending ||
    startGameMutation.isPending;

  const error =
    queryError?.message ||
    addPlayerMutation.error?.message ||
    removePlayerMutation.error?.message ||
    renamePlayerMutation.error?.message ||
    movePlayerMutation.error?.message ||
    startGameMutation.error?.message;

  const currentLobbyData = lobbyData || mockLobbyData;

  const teamColors = {
    "Team Red": "var(--color-team-red, #ff0040)",
    "Team Blue": "var(--color-team-blue, #00d4ff)",
  };

  // Calculate stats
  const totalPlayers =
    currentLobbyData?.teams?.reduce((sum, team) => sum + (team?.players?.length || 0), 0) || 0;
  const canStartGame =
    totalPlayers >= 4 &&
    (currentLobbyData?.teams?.every((team) => (team?.players?.length || 0) >= 2) || false);

  const handleQuickAdd = (teamName: string) => {
    const playerName = teamName === "Team Red" ? teamRedInput.trim() : teamBlueInput.trim();
    if (!playerName) return;

    addPlayerMutation.mutate(
      { playerName, teamName },
      {
        onSuccess: () => {
          if (teamName === "Team Red") {
            setTeamRedInput("");
          } else {
            setTeamBlueInput("");
          }
        },
      },
    );
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayerMutation.mutate(playerId);
  };

  const handleEditPlayer = (player: LobbyPlayer) => {
    setEditingPlayer(player.publicId);
    setEditName(player.name);
  };

  const handleSaveEdit = () => {
    if (!editingPlayer || !editName.trim()) return;

    renamePlayerMutation.mutate(
      { playerId: editingPlayer, newPlayerName: editName.trim() },
      {
        onSuccess: () => {
          setEditingPlayer(null);
          setEditName("");
        },
      },
    );
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    startGameMutation.mutate(undefined, {
      onSuccess: () => {
        navigate(`/game/${gameId}`);
      },
    });
  };

  // Drag and drop handlers
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

    movePlayerMutation.mutate(
      { playerId: draggedPlayer.player.publicId, newTeamName: toTeam },
      {
        onSuccess: () => {
          setDraggedPlayer(null);
        },
        onError: () => {
          setDraggedPlayer(null);
        },
      },
    );
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  };

  // Render empty slots
  const renderEmptySlots = (currentCount: number, maxSlots: number = 6) => {
    const emptyCount = Math.max(0, maxSlots - currentCount);
    return Array.from({ length: emptyCount }).map((_, i) => (
      <div key={`empty-${i}`} className={styles.playerSlot}>
        [empty]
      </div>
    ));
  };

  if (initialLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loadingSpinner}>
            <p>LOADING OPERATIVE CONTROL...</p>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>OPERATIVE CONTROL</h1>
          <div className={styles.gameInfo}>
            Game ID: {currentLobbyData?.publicId || "LOADING..."} | {totalPlayers} Players
          </div>
        </div>

        <div className={styles.teamsGrid}>
          {currentLobbyData?.teams?.map((team) => {
            const teamColor = teamColors[team.name as keyof typeof teamColors] || "#6b7280";
            return (
              <div
                key={team.name}
                className={styles.teamTile}
                style={{ "--team-color": teamColor } as React.CSSProperties}
                data-drag-over={dragOverTeam === team.name}
                onDragOver={(e) => handleDragOver(e, team.name)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, team.name)}
              >
                <div className={styles.teamHeader}>
                  <h2
                    className={styles.teamName}
                    style={{ "--team-color": teamColor } as React.CSSProperties}
                  >
                    {team.name === "Team Red" ? "TEAM RED OPERATIVES" : "TEAM BLUE OPERATIVES"}
                  </h2>
                  <div className={styles.playerCount}>{team?.players?.length || 0}/6 operatives</div>
                </div>

                <div className={styles.playersContainer}>
                  {team?.players?.map((player, index) => (
                    <div
                      key={player.publicId}
                      className={styles.playerTile}
                      draggable
                      data-dragging={draggedPlayer?.player.publicId === player.publicId}
                      onDragStart={(e) => handleDragStart(e, player, team.name)}
                      onDragEnd={handleDragEnd}
                    >
                      {editingPlayer === player.publicId ? (
                        <input
                          className={styles.editableInput}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") {
                              setEditingPlayer(null);
                              setEditName("");
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className={styles.playerName} onDoubleClick={() => handleEditPlayer(player)}>
                          {player?.name || "Unknown Player"}
                        </span>
                      )}

                      <div className={styles.statusDot} />

                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemovePlayer(player?.publicId || "")}
                        disabled={isLoading}
                      >
                        [X]
                      </button>
                    </div>
                  ))}
                  {renderEmptySlots(team?.players?.length || 0)}
                </div>

                <div className={styles.addPlayerArea}>
                  <input
                    className={styles.addInput}
                    placeholder="Enter operative name..."
                    value={team.name === "Team Red" ? teamRedInput : teamBlueInput}
                    onChange={(e) => {
                      if (team.name === "Team Red") {
                        setTeamRedInput(e.target.value);
                      } else {
                        setTeamBlueInput(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd(team.name)}
                    disabled={isLoading}
                  />
                  <button
                    className={styles.addButton}
                    style={{ "--team-color": teamColor } as React.CSSProperties}
                    onClick={() => handleQuickAdd(team.name)}
                    disabled={
                      isLoading ||
                      (team.name === "Team Red" ? !teamRedInput.trim() : !teamBlueInput.trim())
                    }
                  >
                    ADD
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={styles.startButton}
          data-can-start={canStartGame}
          onClick={handleStartGame}
          disabled={!canStartGame || isLoading}
        >
          START MISSION
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default LobbyInterface;
