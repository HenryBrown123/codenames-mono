import React, { useState } from "react";
import styles from "./ui-settings-dashboard.module.css";

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
        </div>
      </div>
    </div>
  );
};