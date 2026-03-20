import React from "react";
import { useVisibilityContext, GAME_PANELS } from "../dashboards/config";
import { PanelRenderer } from "../dashboards/panel-renderer";
import { MiddleSection } from "../dashboards/shared";
import type { PanelSlots } from "../dashboards/config";
import styles from "./stacked-dashboard.module.css";

interface StackedDashboardProps {
  panels?: PanelSlots;
  isFetching?: boolean;
  /**
   * Namespaces Framer Motion layoutIds.
   * Must be unique per mounted instance if ever used in two places simultaneously.
   */
  instanceId?: string;
}

/**
 * Full stacked dashboard — all role-specific panels rendered vertically.
 * Used in: DesktopScene sidebar (landscape), MobileScene portrait drawer.
 */
export const StackedDashboard: React.FC<StackedDashboardProps> = ({
  panels = GAME_PANELS,
  isFetching = false,
  instanceId = "stacked",
}) => {
  const context = useVisibilityContext();

  return (
    <aside className={styles.sidebar}>
      {isFetching && <div className={styles.refetchIndicator} />}
      <div className={styles.inner}>
        <PanelRenderer
          panels={panels.header}
          context={context}
          slotId={`${instanceId}-header`}
        />
        <div className={styles.headerDivider} />
        <MiddleSection>
          <PanelRenderer
            panels={panels.middle}
            context={context}
            slotId={`${instanceId}-middle`}
          />
          <div className={styles.bottomSlot}>
            <PanelRenderer
              panels={panels.bottom}
              context={context}
              slotId={`${instanceId}-bottom`}
            />
          </div>
        </MiddleSection>
      </div>
    </aside>
  );
};
