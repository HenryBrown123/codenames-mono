import React from "react";
import { TerminalSection, TerminalCommand, TerminalOutput } from "../shared";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface ObserverPanelViewProps {
  message?: string;
}

export const ObserverPanelView: React.FC<ObserverPanelViewProps> = ({
  message = "Monitoring field operations...",
}) => {
  return (
    <TerminalSection>
      <TerminalCommand>STANDBY MODE</TerminalCommand>
      <TerminalOutput>{message}</TerminalOutput>
    </TerminalSection>
  );
};

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const ObserverPanel: React.FC = () => {
  return <ObserverPanelView />;
};
