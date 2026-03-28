import React from "react";
import { useViewMode } from "../../../game-board/view-mode/view-mode-context";
import { ToggleSwitch } from "@frontend/gameplay/shared/components";
import {
  TerminalSection,
  TerminalCommand,
  SpyGogglesContainer,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
} from "../shared";

/**
 * Toggle switch for enhanced spymaster vision mode
 */

export interface ARTogglePanelViewProps {
  isARMode: boolean;
  onToggle: () => void;
}

export const ARTogglePanelView: React.FC<ARTogglePanelViewProps> = ({ isARMode, onToggle }) => (
  <TerminalSection>
    <TerminalCommand>ENHANCED VISION</TerminalCommand>
    <SpyGogglesContainer>
      <SpyGogglesSwitchRow>
        <SpyGogglesDot active={isARMode} />
        <ToggleSwitch active={isARMode} onChange={onToggle} />
      </SpyGogglesSwitchRow>
    </SpyGogglesContainer>
  </TerminalSection>
);

export const ARTogglePanel: React.FC = () => {
  const { viewMode, toggleSpymasterViewMode } = useViewMode();
  const isARMode = viewMode === "spymaster";

  return <ARTogglePanelView isARMode={isARMode} onToggle={toggleSpymasterViewMode} />;
};
