import React from "react";
import { TerminalSection, TerminalCommand, TerminalOutput } from "../shared";

/**
 * Panel for spectators showing current game state
 */

export interface ObserverPanelViewProps {
  message?: string;
}

export const ObserverPanelView: React.FC<ObserverPanelViewProps> = ({
  message = "Monitoring field operations...",
}) => (
  <TerminalSection>
    <TerminalCommand>STANDBY MODE</TerminalCommand>
    <TerminalOutput>{message}</TerminalOutput>
  </TerminalSection>
);

export const ObserverPanel: React.FC = () => <ObserverPanelView />;
