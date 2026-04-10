import React from "react";
import { Edit2 } from "lucide-react";
import { WideBarIcon, ExitIcon } from "@frontend/shared/components/icons";
import styles from "../layout/lobby.module.css";

/**
 * Individual player row.
 *
 * Drag is available on any tile via base props (isDraggable).
 * Use `interactive: true` for full edit/remove controls (single-device mode).
 * In multi-device mode, pass isDraggable for just the current user's tile.
 */

interface PlayerTileBaseProps {
  playerName: string;
  isCurrentUser?: boolean;
  isDraggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

interface PlayerTileReadOnlyProps extends PlayerTileBaseProps {
  interactive?: false;
}

interface PlayerTileInteractiveProps extends PlayerTileBaseProps {
  interactive: true;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onEditStart: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export type PlayerTileViewProps = PlayerTileReadOnlyProps | PlayerTileInteractiveProps;

export const PlayerTileView: React.FC<PlayerTileViewProps> = (props) => {
  const {
    playerName,
    isCurrentUser,
    isDraggable = false,
    isDragging = false,
    onDragStart,
    onDragEnd,
  } = props;

  const dragProps = {
    draggable: isDraggable,
    "data-dragging": isDragging,
    onDragStart,
    onDragEnd,
  };

  if (!props.interactive) {
    return (
      <div className={styles.playerTile} {...dragProps}>
        {isDraggable && <WideBarIcon className={styles.dragHandle} />}
        <span className={styles.playerName}>{playerName}</span>
        {isCurrentUser && <span className={styles.youBadge}>(You)</span>}
      </div>
    );
  }

  const {
    isEditing = false,
    editValue = "",
    onEditChange,
    onEditSave,
    onEditCancel,
    onEditStart,
    onRemove,
    disabled = false,
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") onEditSave?.();
    if (e.key === "Escape") onEditCancel?.();
  };

  return (
    <div className={styles.playerTile} {...dragProps}>
      {isDraggable && <WideBarIcon className={styles.dragHandle} />}

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
          aria-label="Remove player"
        >
          <ExitIcon />
        </button>
      </div>
    </div>
  );
};
