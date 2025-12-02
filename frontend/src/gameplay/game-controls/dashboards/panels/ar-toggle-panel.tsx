import React, { useEffect } from "react";
import { useViewMode } from "../../../game-board/view-mode/view-mode-context";
import {
  TerminalSection,
  TerminalCommand,
  SpyGogglesContainer,
  SpyGogglesText,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
  SpySwitch,
  SpySlider,
  SpyStatus,
} from "../shared";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface ARTogglePanelViewProps {
  isARMode: boolean;
  onToggle: () => void;
}

export const ARTogglePanelView: React.FC<ARTogglePanelViewProps> = ({
  isARMode,
  onToggle,
}) => {
  return (
    <TerminalSection>
      <TerminalCommand>SPY GOGGLES</TerminalCommand>
      <SpyGogglesContainer>
        <SpyGogglesText>Toggle enhanced vision</SpyGogglesText>
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
};

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const ARTogglePanel: React.FC = () => {
  const { viewMode, toggleSpymasterViewMode } = useViewMode();

  const isARMode = viewMode === "spymaster";

  // Keyboard shortcut for power users
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        toggleSpymasterViewMode();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleSpymasterViewMode]);

  return <ARTogglePanelView isARMode={isARMode} onToggle={toggleSpymasterViewMode} />;
};
