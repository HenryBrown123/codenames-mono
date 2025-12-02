/**
 * Sandbox Panel Components
 *
 * These panels use the View components with mock data
 * instead of making API calls.
 */

import React from "react";
import { AIStatusPanelView } from "../gameplay/game-controls/dashboards/panels";

/**
 * Sandbox version of AI Status Panel.
 * Note: Requires a real game context to display data.
 */
export const SandboxAIStatusPanel: React.FC = () => (
  <AIStatusPanelView gameId="sandbox-mock-game" />
);
