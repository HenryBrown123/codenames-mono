import React from "react";
import { TerminalSection, TerminalCommand, TerminalOutput } from "../shared";

/**
 * Observer Panel - Displayed when the player is observing (not their turn).
 * Shows a simple status message.
 */
export const ObserverPanel: React.FC = () => {
  return (
    <TerminalSection>
      <TerminalCommand>STANDBY MODE</TerminalCommand>
      <TerminalOutput>Monitoring field operations...</TerminalOutput>
    </TerminalSection>
  );
};
