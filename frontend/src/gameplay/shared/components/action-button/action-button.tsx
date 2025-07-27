import React from "react";
import styles from './action-button.module.css';

type ButtonProp = {
  text?: string;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
};

const ActionButton: React.FC<ButtonProp> = ({
  text = "EXECUTE",
  enabled = true,
  onClick,
  className,
}) => {
  return (
    <button 
      className={`${styles.button} ${className || ''}`}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
    >
      {text}
    </button>
  );
};

export default ActionButton;