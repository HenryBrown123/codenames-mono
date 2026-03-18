import React from "react";
import { CondensedDashboard } from "../condensed-dashboard";

interface PortraitDashboardProps {
  onOpenClueInput: () => void;
}

/**
 * Portrait layout dashboard.
 * Renders CondensedDashboard — the reusable compact panel component.
 */
export const PortraitDashboard: React.FC<PortraitDashboardProps> = ({ onOpenClueInput }) => (
  <CondensedDashboard onOpenClueInput={onOpenClueInput} />
);
