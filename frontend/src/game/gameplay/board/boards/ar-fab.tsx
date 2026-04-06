import React, { useEffect } from "react";
import { useViewMode } from "../view-mode/view-mode-context";
import { useVisibilityContext } from "../../dashboard/config/context";
import { canUseArToggle } from "../../dashboard/config/rules";
import styles from "./ar-fab.module.css";

/**
 * AR toggle — small circular button with a glowing dot.
 * Dashboard-panel-style background so it looks like a mini panel.
 * The expand-lens circle radiates from this button's center.
 *
 * Only rendered for codemasters. Positioned by the parent scene.
 * Registers Alt+A keyboard shortcut.
 */
export const ArFab: React.FC = () => {
  const ctx = useVisibilityContext();
  const { viewMode, toggleSpymasterViewMode } = useViewMode();
  const isOn = viewMode === "spymaster";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        toggleSpymasterViewMode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSpymasterViewMode]);

  if (!canUseArToggle(ctx)) return null;

  return (
    <button
      className={`${styles.fab} ${isOn ? styles.on : styles.off}`}
      onClick={toggleSpymasterViewMode}
      aria-label={isOn ? "Disable AR vision" : "Enable AR vision"}
      aria-pressed={isOn}
      data-ar-fab
    >
      <span className={styles.dot} />
    </button>
  );
};
