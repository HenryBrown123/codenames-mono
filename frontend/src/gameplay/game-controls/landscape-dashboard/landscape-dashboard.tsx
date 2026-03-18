import React from "react";
import { useVisibilityContext, GAME_PANELS } from "../dashboards/config";
import { useDashboardState } from "../dashboards/use-dashboard-state";
import { PanelRenderer } from "../dashboards/panel-renderer";
import { MiddleSection } from "../dashboards/shared";
import type { PanelSlots } from "../dashboards/config";
import styles from "./landscape-dashboard.module.css";

interface LandscapeDashboardProps {
  panels?: PanelSlots;
  isFetching?: boolean;
}

/**
 * Landscape/desktop sidebar.
 * Owns sidebar chrome (background, border, scroll, refetch indicator)
 * and renders all role-specific panels via the panel-slot system.
 * Replaces GameDashboard — call this directly from game-scene.
 */
export const LandscapeDashboard: React.FC<LandscapeDashboardProps> = ({
  panels = GAME_PANELS,
  isFetching = false,
}) => {
  const { isRoundComplete, role } = useDashboardState();
  const context = useVisibilityContext();

  return (
    <aside className={styles.sidebar}>
      {isFetching && <div className={styles.refetchIndicator} />}

      {/* key swap forces panel remount on role/round changes */}
      <div
        className={styles.inner}
        key={isRoundComplete ? "game-over" : `${role}-dashboard`}
      >
        <PanelRenderer panels={panels.header} context={context} slotId="header" />

        <MiddleSection>
          <PanelRenderer panels={panels.middle} context={context} slotId="middle" />
          <div className={styles.bottomSlot}>
            <PanelRenderer panels={panels.bottom} context={context} slotId="bottom" />
          </div>
        </MiddleSection>
      </div>
    </aside>
  );
};
