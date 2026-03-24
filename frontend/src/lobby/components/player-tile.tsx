import React from "react";
import { GripVertical, Edit2 } from "lucide-react";
import styles from "../lobby.module.css";

/**
 * Individual player row - read-only in multi-device, draggable/editable in single-device.
 *
 * Use `interactive: true` for single-device mode (drag, edit, remove).
 * Omit or set `interactive` to false for multi-device read-only mode.
 */

interface PlayerTileBaseProps {
  playerName: string;
  isCurrentUser?: boolean;
}

interface PlayerTileReadOnlyProps extends PlayerTileBaseProps {
  interactive?: false;
}

interface PlayerTileInteractiveProps extends PlayerTileBaseProps {
  interactive: true;
  isDraggable?: boolean;
  isDragging?: boolean;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditStart: () => void;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export type PlayerTileViewProps = PlayerTileReadOnlyProps | PlayerTileInteractiveProps;

export const PlayerTileView: React.FC<PlayerTileViewProps> = (props) => {
  const { playerName, isCurrentUser } = props;

  // Read-only mode (multi-device)
  if (!props.interactive) {
    return (
      <div className={styles.playerTile}>
        <span className={styles.playerName}>{playerName}</span>
        {isCurrentUser && <span className={styles.youBadge}>(You)</span>}
      </div>
    );
  }

  // Interactive mode (single-device) — destructure interactive-only props
  const {
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
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") onEditSave?.();
    if (e.key === "Escape") onEditCancel?.();
  };

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
    </div>
  );
};
