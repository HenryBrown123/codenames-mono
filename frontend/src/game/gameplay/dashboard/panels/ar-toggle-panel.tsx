import React from "react";
import { useViewMode } from "../../board/view-mode/view-mode-context";
import { ToggleSwitch } from "@frontend/game/gameplay/shared/components";
import {
  TerminalSection,
  TerminalCommand,
  SpyGogglesContainer,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
} from "../shared";

/** Props for {@link ARTogglePanelView}. */
export interface ARTogglePanelViewProps {
  isARMode: boolean;
  onToggle: () => void;
}

/** Presentational AR-vision toggle row. */
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

/** Connected AR-vision toggle — bound to the view-mode context. */
export const ARTogglePanel: React.FC = () => {
  const { viewMode, toggleSpymasterViewMode } = useViewMode();
  const isARMode = viewMode === "spymaster";

  return <ARTogglePanelView isARMode={isARMode} onToggle={toggleSpymasterViewMode} />;
};
