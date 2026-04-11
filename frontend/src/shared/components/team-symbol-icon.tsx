import React from "react";
import {
  TeamSquareIcon, TeamDiamondIcon, CircleIcon, BlackSkullIcon,
  TeamSquareIconFilled, TeamDiamondIconFilled,
} from "./icons";
import styles from "./team-symbol-icon.module.css";

interface TeamSymbolIconProps {
  symbol: string;
  rotate: boolean;
  color?: string;
  className?: string;
  filled?: boolean;
}

/**
 * Renders a team symbol as a dotted SVG icon.
 * Red team gets the diamond (rotated square), blue team gets the square.
 * Maps legacy text glyphs ("■" / "□" / "○" / "☠") to dotted svgs.
 * Pass filled=true for pattern-filled variants (used on cover cards).
 */
export const TeamSymbolIcon: React.FC<TeamSymbolIconProps> = ({
  symbol,
  rotate,
  color,
  className,
  filled = false,
}) => {
  const Icon =
    symbol === "○" ? CircleIcon :
    symbol === "☠" ? BlackSkullIcon :
    rotate
      ? (filled ? TeamDiamondIconFilled : TeamDiamondIcon)
      : (filled ? TeamSquareIconFilled : TeamSquareIcon);

  return (
    <span
      className={`${styles.icon} ${rotate ? styles.rotated : ""} ${className ?? ""}`}
      style={color ? { color, "--symbol-color": color } as React.CSSProperties : undefined}
    >
      <Icon />
    </span>
  );
};
