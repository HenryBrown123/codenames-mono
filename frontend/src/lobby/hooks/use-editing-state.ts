import { useState, useCallback } from "react";
import type { LobbyPlayer } from "@frontend/lobby/api";

/** Editing state for player name edits */
export interface EditingState {
  editingPlayerId: string | null;
  editValue: string;
}

/** Return type of useEditingState hook */
export interface UseEditingStateReturn {
  state: EditingState;
  isEditing: (playerId: string) => boolean;
  editValue: string;
  startEdit: (player: LobbyPlayer) => void;
  setEditValue: (value: string) => void;
  cancelEdit: () => void;
  getEditPayload: () => { playerId: string; newName: string } | null;
  reset: () => void;
}

/**
 * Manages editing state for player names.
 * Returns state and handlers for inline editing operations.
 */
export function useEditingState(): UseEditingStateReturn {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const isEditing = useCallback(
    (playerId: string) => editingPlayerId === playerId,
    [editingPlayerId],
  );

  const startEdit = useCallback((player: LobbyPlayer) => {
    setEditingPlayerId(player.publicId);
    setEditValue(player.name);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingPlayerId(null);
    setEditValue("");
  }, []);

  const getEditPayload = useCallback(() => {
    if (!editingPlayerId || !editValue.trim()) {
      return null;
    }
    return { playerId: editingPlayerId, newName: editValue.trim() };
  }, [editingPlayerId, editValue]);

  const reset = useCallback(() => {
    setEditingPlayerId(null);
    setEditValue("");
  }, []);

  return {
    state: { editingPlayerId, editValue },
    isEditing,
    editValue,
    startEdit,
    setEditValue,
    cancelEdit,
    getEditPayload,
    reset,
  };
}
