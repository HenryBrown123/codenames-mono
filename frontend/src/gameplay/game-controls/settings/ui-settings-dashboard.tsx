import React, { useState } from "react";
import styles from "./ui-settings-dashboard.module.css";

/**
 * Settings panel for UI customization options
 */

/** Preset terminal colours (7×2 grid) */
const TERMINAL_COLOURS = [
  "#00ff88", "#52d68a", "#00ffcc", "#00ffff", "#ff00aa", "#ffaa00", "#ff6600",
  "#ff4444", "#aaaaff", "#aa88ff", "#88aaff", "#ffffff", "#cccccc", "#888888",
];

export const DEFAULT_TERMINAL_COLOUR = "#52d68a";

/** Convert hex to RGB object */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 82, g: 214, b: 138 }; // fallback to default
}

/** Apply terminal colour to :root and generate derived tokens */
export function applyTerminalColour(hex: string): void {
  const { r, g, b } = hexToRgb(hex);
  const root = document.documentElement;

  // Primary colour
  root.style.setProperty("--color-primary", hex);

  // Border tokens
  root.style.setProperty("--border-dim", `1px solid rgba(${r}, ${g}, ${b}, 0.14)`);
  root.style.setProperty("--border-subtle", `1px solid rgba(${r}, ${g}, ${b}, 0.24)`);
  root.style.setProperty("--border-normal", `1px solid rgba(${r}, ${g}, ${b}, 0.35)`);
  root.style.setProperty("--border-strong", `1px solid ${hex}`);
  root.style.setProperty("--border-heavy", `2px solid ${hex}`);

  // Glow tokens
  root.style.setProperty("--glow-score", `0 0 8px rgba(${r}, ${g}, ${b}, 0.25)`);
  root.style.setProperty("--glow-clue", `0 0 8px rgba(${r}, ${g}, ${b}, 0.11)`);
  root.style.setProperty("--glow-box-sm", `0 0 16px rgba(${r}, ${g}, ${b}, 0.20)`);

  // Background tokens
  root.style.setProperty("--bg-highlight", `rgba(${r}, ${g}, ${b}, 0.06)`);

  // Scrollbar and scanline tokens (track primary colour)
  root.style.setProperty("--bg-scrollbar", `rgba(${r}, ${g}, ${b}, 0.35)`);
  root.style.setProperty("--scan-color", `rgba(${r}, ${g}, ${b}, 0.015)`);
  // Note: --bg-panel, --bg-panel-tinted, --bg-overlay don't need updating
  // — they are near-black and colour-neutral intentionally
}

interface UISettingsDashboardProps {
  // Font controls
  fontNormalSize: number;
  fontLongSize: number;
  fontThreshold: number;
  onFontNormalSizeChange: (size: number) => void;
  onFontLongSizeChange: (size: number) => void;
  onFontThresholdChange: (threshold: number) => void;

  // Tilt control
  tiltValue: number;
  onTiltChange: (tilt: number) => void;

  // Colour control
  terminalColour: string;
  onTerminalColourChange: (colour: string) => void;
}

export const UISettingsDashboard: React.FC<UISettingsDashboardProps> = ({
  fontNormalSize,
  fontLongSize,
  fontThreshold,
  onFontNormalSizeChange,
  onFontLongSizeChange,
  onFontThresholdChange,
  tiltValue,
  onTiltChange,
  terminalColour,
  onTerminalColourChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.settingsContainer}>
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        data-expanded={isExpanded}
      >
        <span className={styles.toggleIcon}>⚙️</span>
        <span className={styles.toggleText}>UI</span>
      </button>

      {/* Settings Panel */}
      <div 
        className={styles.settingsPanel}
        data-expanded={isExpanded}
      >
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>UI Settings</h3>
          <button
            className={styles.closeButton}
            onClick={() => setIsExpanded(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.settingsGrid}>
          {/* Font Size Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.sectionTitle}>Font Sizes</h4>
            
            <div className={styles.controlGroup}>
              <label className={styles.label}>
                Normal: {fontNormalSize}px
              </label>
              <input
                type="range"
                min="10"
                max="32"
                step="1"
                value={fontNormalSize}
                onChange={(e) => onFontNormalSizeChange(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.label}>
                Long: {fontLongSize}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={fontLongSize}
                onChange={(e) => onFontLongSizeChange(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.label}>
                Threshold: {fontThreshold}
              </label>
              <input
                type="range"
                min="6"
                max="15"
                step="1"
                value={fontThreshold}
                onChange={(e) => onFontThresholdChange(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

          {/* Board Controls Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.sectionTitle}>Board Controls</h4>

            <div className={styles.controlGroup}>
              <label className={styles.label}>
                Tilt: {tiltValue}°
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={tiltValue}
                onChange={(e) => onTiltChange(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

          {/* Terminal Colour Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.sectionTitle}>Terminal Colour</h4>
            <div className={styles.colourGrid}>
              {TERMINAL_COLOURS.map((colour) => (
                <button
                  key={colour}
                  className={styles.colourSwatch}
                  style={{ backgroundColor: colour }}
                  data-selected={terminalColour === colour}
                  onClick={() => onTerminalColourChange(colour)}
                  aria-label={`Select colour ${colour}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};