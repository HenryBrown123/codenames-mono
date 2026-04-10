import React from "react";
import { TeamSquareIcon, TeamDiamondIcon, CircleIcon, BlackSkullIcon } from "./icons";
import styles from "./team-symbol-icon.module.css";

interface TeamSymbolIconProps {
  symbol: string;
  rotate: boolean;
  color?: string;
  className?: string;
}

/**
 * Renders a team symbol as a dotted SVG icon.
 * Red team gets the diamond (rotated square), blue team gets the square.
 * Maps legacy text glyphs ("■" / "□" / "○" / "☠") to dotted svgs.
 */
export const TeamSymbolIcon: React.FC<TeamSymbolIconProps> = ({
  symbol,
  rotate,
  color,
  className,
}) => {
  const Icon =
    symbol === "○" ? CircleIcon :
    symbol === "☠" ? BlackSkullIcon :
    rotate ? TeamDiamondIcon : TeamSquareIcon;

  return (
    <span
      className={`${styles.icon} ${rotate ? styles.rotated : ""} ${className ?? ""}`}
      style={color ? { color, "--symbol-color": color } as React.CSSProperties : undefined}
    >
      <Icon />
    </span>
  );
};
