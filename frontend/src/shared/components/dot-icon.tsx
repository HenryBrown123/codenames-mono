import React from "react";
import iconStyles from "./icon.module.css";

export interface DotIconProps {
  /**
   * Pixel pattern. Each string is a row; any non-space, non-dot character
   * draws a dot. Use "#" for filled, "." or " " for empty. All rows should
   * be the same length.
   *
   * Example — 7x6 speech bubble:
   *   [
   *     ".#####.",
   *     "#.....#",
   *     "#.....#",
   *     ".#####.",
   *     "..#....",
   *     ".#.....",
   *   ]
   */
  pattern: string[];
  /** Adds a soft glow matching the game's primary aesthetic. */
  glow?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Renders a pixel-art icon as a grid of SVG circles — matching the Doto
 * dot-matrix font aesthetic used elsewhere in the dashboard.
 *
 * Sized via CSS (defaults to 1em tall via the shared `.icon` class).
 */
export const DotIcon: React.FC<DotIconProps> = ({
  pattern,
  glow = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((r) => r.length));
  const cell = 1;
  const radius = 0.38;

  const dots: React.ReactElement[] = [];
  for (let y = 0; y < rows; y++) {
    const row = pattern[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch !== "." && ch !== " ") {
        dots.push(
          <circle
            key={`${x}-${y}`}
            cx={x * cell + cell / 2}
            cy={y * cell + cell / 2}
            r={radius}
          />,
        );
      }
    }
  }

  const filterId = glow ? `dot-icon-glow-${rows}-${cols}` : undefined;

  return (
    <svg
      className={`${iconStyles.icon} ${className ?? ""}`}
      viewBox={`0 0 ${cols} ${rows}`}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      shapeRendering="geometricPrecision"
    >
      {glow && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.25" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.6" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glow ? `url(#${filterId})` : undefined}>{dots}</g>
    </svg>
  );
};
