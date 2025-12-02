import React from "react";
import { useVisibilityContext, GAME_PANELS } from "./config";
import { PanelRenderer } from "./panel-renderer";
import { MiddleSection } from "./shared";
import styles from "./shared-dashboard.module.css";

/**
 * Config-driven dashboard.
 * No visibility logic here - just structure.
 * Panels are rendered based on visibility rules defined in game-panels.ts.
 */
export const GameDashboard: React.FC = () => {
  const context = useVisibilityContext();

  return (
    <div className={styles.desktopContainer}>
      <PanelRenderer panels={GAME_PANELS.header} context={context} slotId="header" />

      <MiddleSection>
        <PanelRenderer panels={GAME_PANELS.middle} context={context} slotId="middle" />
      </MiddleSection>

      <PanelRenderer panels={GAME_PANELS.bottom} context={context} slotId="bottom" />
    </div>
  );
};
