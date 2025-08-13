import React from "react";
import styles from "./font-size-control.module.css";

interface FontSizeControlProps {
  normalSize: number;
  longSize: number;
  threshold: number;
  onNormalSizeChange: (size: number) => void;
  onLongSizeChange: (size: number) => void;
  onThresholdChange: (threshold: number) => void;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  normalSize,
  longSize,
  threshold,
  onNormalSizeChange,
  onLongSizeChange,
  onThresholdChange,
}) => {
  return (
    <div className={styles.fontControlContainer}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>
          Normal: {normalSize}px
        </label>
        <input
          type="range"
          min="10"
          max="32"
          step="1"
          value={normalSize}
          onChange={(e) => onNormalSizeChange(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>
          Long: {longSize}px
        </label>
        <input
          type="range"
          min="8"
          max="24"
          step="1"
          value={longSize}
          onChange={(e) => onLongSizeChange(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>
          Threshold: {threshold}
        </label>
        <input
          type="range"
          min="6"
          max="15"
          step="1"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  );
};