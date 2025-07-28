import React from "react";
import styles from "./tilt-control.module.css";


interface TiltControlProps {
  value: number;
  onChange: (degrees: number) => void;
}

/**
 * Board tilt control slider for 3D perspective effect
 */
export const TiltControl: React.FC<TiltControlProps> = ({ value, onChange }) => {
  return (
    <div className={`${styles.controlContainer} desktop-only`}>
      <label className={styles.label} htmlFor="board-tilt">Board Tilt</label>
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
};