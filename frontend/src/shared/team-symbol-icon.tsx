import React from "react";
import styles from "./team-symbol-icon.module.css";

interface TeamSymbolIconProps {
  symbol: string;
  rotate: boolean;
  color?: string;
  className?: string;
}

export const TeamSymbolIcon: React.FC<TeamSymbolIconProps> = ({
  symbol,
  rotate,
  color,
  className,
}) => (
  <span
    className={`${styles.icon} ${rotate ? styles.rotated : ""} ${className ?? ""}`}
    style={color ? { "--symbol-color": color } as React.CSSProperties : undefined}
  >
    {symbol}
  </span>
);
