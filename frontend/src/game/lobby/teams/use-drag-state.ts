import { useState, useCallback } from "react";
import type { LobbyPlayer } from "@frontend/game/lobby/api";

/** Drag state for player tiles */
export interface DragState {
  draggedPlayer: { player: LobbyPlayer; fromTeam: string } | null;
  dragOverTeam: string | null;
}

/** Return type of useDragState hook */
export interface UseDragStateReturn {
  state: DragState;
  isDragging: (playerId: string) => boolean;
  isDragOver: (teamName: string) => boolean;
  onDragStart: (e: React.DragEvent, player: LobbyPlayer, fromTeam: string) => void;
  onDragOver: (e: React.DragEvent, teamName: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, toTeam: string) => { player: LobbyPlayer; toTeam: string } | null;
  onDragEnd: () => void;
  reset: () => void;
}

/**
 * Manages drag-and-drop state for player tiles between teams.
 * Returns state and handlers for drag operations.
 */
export function useDragState(): UseDragStateReturn {
  const [draggedPlayer, setDraggedPlayer] = useState<DragState["draggedPlayer"]>(null);
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null);

  const isDragging = useCallback(
    (playerId: string) => draggedPlayer?.player.publicId === playerId,
    [draggedPlayer],
  );

  const isDragOver = useCallback(
    (teamName: string) => dragOverTeam === teamName,
    [dragOverTeam],
  );

  const onDragStart = useCallback(
    (e: React.DragEvent, player: LobbyPlayer, fromTeam: string) => {
      setDraggedPlayer({ player, fromTeam });
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const onDragOver = useCallback((e: React.DragEvent, teamName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTeam(teamName);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTeam(null);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent, toTeam: string) => {
      e.preventDefault();
      setDragOverTeam(null);

      if (!draggedPlayer || draggedPlayer.fromTeam === toTeam) {
        setDraggedPlayer(null);
        return null;
      }

      const result = { player: draggedPlayer.player, toTeam };
      return result;
    },
    [draggedPlayer],
  );

  const onDragEnd = useCallback(() => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  }, []);

  const reset = useCallback(() => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  }, []);

  return {
    state: { draggedPlayer, dragOverTeam },
    isDragging,
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    reset,
  };
}
