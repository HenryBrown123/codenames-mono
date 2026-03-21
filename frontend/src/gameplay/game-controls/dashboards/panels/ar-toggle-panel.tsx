import React from "react";
import { useViewMode } from "../../../game-board/view-mode/view-mode-context";
import {
  TerminalSection,
  TerminalCommand,
  SpyGogglesContainer,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
  SpySwitch,
  SpySlider,
  SpyStatus,
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
        <SpySwitch>
          <input type="checkbox" checked={isARMode} onChange={onToggle} />
          <SpySlider />
        </SpySwitch>
        <SpyStatus active={isARMode}>{isARMode ? "ON" : "OFF"}</SpyStatus>
      </SpyGogglesSwitchRow>
    </SpyGogglesContainer>
  </TerminalSection>
);

export const ARTogglePanel: React.FC = () => {
  const { viewMode, toggleSpymasterViewMode } = useViewMode();
  const isARMode = viewMode === "spymaster";

  return <ARTogglePanelView isARMode={isARMode} onToggle={toggleSpymasterViewMode} />;
};
