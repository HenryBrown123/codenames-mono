import React from "react";
import styles from "./tilt-control.module.css";

/**
 * Slider control for adjusting card 3D tilt amount
 */

interface TiltControlProps {
  value: number;
  onChange: (degrees: number) => void;
}

export const TiltControl: React.FC<TiltControlProps> = ({ value, onChange }) => (
  <div className={`${styles.controlContainer} desktop-only`}>
    <label className={styles.label} htmlFor="board-tilt">
      Board Tilt
    </label>
    <input
      className={styles.slider}
      id="board-tilt"
      type="range"
      min="0"
      max="90"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className={styles.value}>{value}°</span>
  </div>
);