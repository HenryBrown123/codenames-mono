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

/**
 * AR Toggle Panel - Spymaster view toggle.
 * Allows codemaster to toggle between normal and spymaster view.
 */
export const ARTogglePanel: React.FC = () => {
  const { viewMode, toggleSpymasterViewMode } = useViewMode();

  const isARMode = viewMode === "spymaster";

  const handleARToggle = () => {
    toggleSpymasterViewMode();
  };

  // Keyboard shortcut for power users
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handleARToggle();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <TerminalSection>
      <TerminalCommand>SPY GOGGLES</TerminalCommand>
      <SpyGogglesContainer>
        <SpyGogglesText>Toggle enhanced vision</SpyGogglesText>
        <SpyGogglesSwitchRow>
          <SpyGogglesDot active={isARMode} />
          <SpySwitch>
            <input type="checkbox" checked={isARMode} onChange={handleARToggle} />
            <SpySlider />
          </SpySwitch>
          <SpyStatus active={isARMode}>{isARMode ? "ON" : "OFF"}</SpyStatus>
        </SpyGogglesSwitchRow>
      </SpyGogglesContainer>
    </TerminalSection>
  );
};
