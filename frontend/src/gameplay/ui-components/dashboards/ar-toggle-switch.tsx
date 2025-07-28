import React from "react";
import styles from "./ar-toggle-switch.module.css";

interface ARToggleSwitchProps {
  active: boolean;
  onChange: () => void;
}

export const ARToggleSwitch: React.FC<ARToggleSwitchProps> = ({ active, onChange }) => {
  return (
    <div className={styles.toggleContainer}>
      <span className={styles.toggleLabel} data-active={!active}>OFF</span>
      <button className={styles.toggleTrack} data-active={active} onClick={onChange}>
        <div className={styles.toggleThumb} data-active={active} />
      </button>
      <span className={styles.toggleLabel} data-active={active}>AR</span>
    </div>
  );
};