import React from "react";
import { Edit2 } from "lucide-react";
import styles from "../lobby.module.css";

/** Display state for the editable player tile */
export interface EditablePlayerTileData {
  playerName: string;
  isEditing: boolean;
  editValue: string;
  disabled: boolean;
}

/** Callbacks for editing and removing a player */
export interface EditablePlayerTileHandlers {
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditStart: () => void;
  onRemove: () => void;
}

/** Full props for the editable player tile */
export type EditablePlayerTileProps = EditablePlayerTileData & EditablePlayerTileHandlers;

export const EditablePlayerTile: React.FC<EditablePlayerTileProps> = ({
  playerName,
  isEditing,
  editValue,
  disabled,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditStart,
  onRemove,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEditSave();
    if (e.key === "Escape") onEditCancel();
  };

  return (
    <div className={styles.playerTile}>
      {isEditing ? (
        <input
          className={styles.editableInput}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <>
          <span className={styles.playerName}>{playerName}</span>
          <div className={styles.playerActions}>
            <button
              className={styles.editButton}
              onClick={onEditStart}
              disabled={disabled}
              title="Edit name"
            >
              <Edit2 size={14} />
            </button>
            <button
              className={styles.removeButton}
              onClick={onRemove}
              disabled={disabled}
              title="Remove player"
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
};
