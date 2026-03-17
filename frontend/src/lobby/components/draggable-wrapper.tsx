import React from "react";
import { GripVertical } from "lucide-react";
import styles from "../lobby.module.css";

/** Whether the wrapped element is currently being dragged */
export interface DraggableWrapperData {
  isDragging: boolean;
}

/** Drag lifecycle callbacks */
export interface DraggableWrapperHandlers {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

/** Full props for the draggable wrapper */
export type DraggableWrapperProps = DraggableWrapperData &
  DraggableWrapperHandlers & {
    children: React.ReactNode;
  };

/**
 * Wraps any content to make it draggable.
 * Adds a drag handle and manages drag attributes.
 * Completely decoupled from what it wraps.
 */
export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  isDragging,
  onDragStart,
  onDragEnd,
  children,
}) => (
  <div
    className={styles.draggableItem}
    draggable
    data-dragging={isDragging}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
  >
    <GripVertical className={styles.dragHandle} size={16} />
    {children}
  </div>
);
