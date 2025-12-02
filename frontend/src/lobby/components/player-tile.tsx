import React from "react";
import { GripVertical, Edit2 } from "lucide-react";
import styles from "../lobby.module.css";

/**
 * Individual player row - read-only in multi-device, draggable/editable in single-device
 */

export interface PlayerTileViewProps {
  playerName: string;
  isCurrentUser?: boolean;
  isDraggable?: boolean;
  isDragging?: boolean;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditStart?: () => void;
  onRemove?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export const PlayerTileView: React.FC<PlayerTileViewProps> = ({
  playerName,
  isCurrentUser,
  isDraggable = false,
  isDragging = false,
  isEditing = false,
  editValue = "",
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditStart,
  onRemove,
  onDragStart,
  onDragEnd,
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onEditSave?.();
    if (e.key === "Escape") onEditCancel?.();
  };

  // Multi-device mode: simple read-only tile
  if (!isDraggable && !onEditStart && !onRemove) {
    return (
      <div className={styles.playerTile}>
        <span className={styles.playerName}>{playerName}</span>
        {isCurrentUser && <span className={styles.youBadge}>(You)</span>}
      </div>
    );
  }

  // Single-device mode: full interactive tile
  return (
    <div
      className={styles.playerTile}
      draggable={isDraggable}
      data-dragging={isDragging}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isDraggable && <GripVertical className={styles.dragHandle} size={16} />}

      {isEditing ? (
        <input
          className={styles.editableInput}
          value={editValue}
          onChange={(e) => onEditChange?.(e.target.value)}
          onBlur={onEditSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className={styles.playerName}>{playerName}</span>
      )}

      {(onEditStart || onRemove) && (
        <div className={styles.playerActions}>
          {onEditStart && (
            <button
              className={styles.editButton}
              onClick={onEditStart}
              disabled={disabled}
              title="Edit name"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onRemove && (
            <button
              className={styles.removeButton}
              onClick={onRemove}
              disabled={disabled}
              title="Remove player"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};
