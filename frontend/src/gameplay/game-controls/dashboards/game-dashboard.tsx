import React from "react";
import { useVisibilityContext, GAME_PANELS } from "./config";
import type { PanelSlots } from "./config";
import { PanelRenderer } from "./panel-renderer";
import { MiddleSection } from "./shared";
import styles from "./shared-dashboard.module.css";

interface GameDashboardProps {
  panels?: PanelSlots;
}

/**
 * Config-driven dashboard.
 * No visibility logic here - just structure.
 * Panels are rendered based on visibility rules defined in game-panels.ts.
 */
export const GameDashboard: React.FC<GameDashboardProps> = ({ panels = GAME_PANELS }) => {
  const context = useVisibilityContext();

  return (
    <div className={styles.desktopContainer}>
      <PanelRenderer panels={panels.header} context={context} slotId="header" />

      <MiddleSection>
        <PanelRenderer panels={panels.middle} context={context} slotId="middle" />
      </MiddleSection>

      <PanelRenderer panels={panels.bottom} context={context} slotId="bottom" />
    </div>
  );
};
