import React, { useEffect } from "react";
import { useViewMode } from "../view-mode/view-mode-context";
import { useVisibilityContext } from "../../game-controls/dashboards/config/context";
import { isCodemaster } from "../../game-controls/dashboards/config/rules";
import styles from "./ar-fab.module.css";

/**
 * Floating AR toggle button pinned to the bottom-right of the game board.
 * Circle with green border ring when on, near-invisible when off.
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

  if (!isCodemaster(ctx)) return null;

  return (
    <button
      className={`${styles.fab} ${isOn ? styles.on : styles.off}`}
      onClick={toggleSpymasterViewMode}
      aria-label={isOn ? "Disable AR vision" : "Enable AR vision"}
      aria-pressed={isOn}
    >
      <svg
        className={styles.icon}
        width="22"
        height="22"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        {/* Almond lens */}
        <path
          d="M2 10 Q10 3.5 18 10 Q10 16.5 2 10 Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Iris */}
        <circle cx="10" cy="10" r="3.2" fill="currentColor" />
        {/* Pupil */}
        <circle cx="10" cy="10" r="1.4" fill="rgba(0,0,0,0.5)" />
      </svg>
    </button>
  );
};
