import React, { useEffect, useMemo, useRef, useState } from "react";

export interface DottedPathProps {
  /**
   * One or more SVG path `d` strings. Each path is sampled independently
   * so you can pass multiple strokes for a single icon (e.g. an X is two
   * diagonal lines).
   */
  d: string | string[];
  /** SVG viewBox for the source path (same coordinate system as `d`). */
  viewBox: string;
  /** Rendered pixel size (width). Height follows the viewBox aspect ratio. */
  size?: number;
  /** Spacing between dots, in the path's own coordinate units. */
  spacing?: number;
  /** Dot radius, in the path's own coordinate units. */
  dotRadius?: number;
  /** Dot colour (defaults to `currentColor`). */
  color?: string;
  /** Adds a soft glow halo matching the DotIcon primitive. */
  glow?: boolean;
  className?: string;
  "aria-label"?: string;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Samples a set of equally-spaced points along an SVG path `d` string,
 * using the browser's native `getTotalLength` / `getPointAtLength`.
 *
 * Runs in an effect so it only executes client-side (SVGPathElement
 * isn't available during SSR).
 */
const samplePath = (d: string, spacing: number): Point[] => {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  const length = path.getTotalLength();
  if (length === 0 || spacing <= 0) return [];
  const count = Math.max(1, Math.round(length / spacing));
  const points: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const distance = (length * i) / count;
    const p = path.getPointAtLength(distance);
    points.push({ x: p.x, y: p.y });
  }
  return points;
};

/**
 * Renders an SVG path (or set of paths) as a row of evenly-spaced dots —
 * an automatic "dot-matrix"-ification of any line art. Handy for turning
 * existing icon sets (Feather, Lucide, heroicons…) into the dotted aesthetic.
 *
 * ## Example
 * ```tsx
 * // Auto-dotted "X" — two diagonal strokes
 * <DottedPath
 *   viewBox="0 0 24 24"
 *   d={["M6 6 L18 18", "M18 6 L6 18"]}
 *   size={18}
 *   spacing={3}
 *   glow
 * />
 * ```
 */
export const DottedPath: React.FC<DottedPathProps> = ({
  d,
  viewBox,
  size = 16,
  spacing = 2.5,
  dotRadius = 0.9,
  color = "currentColor",
  glow = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const paths = useMemo(() => (Array.isArray(d) ? d : [d]), [d]);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const all = paths.flatMap((p) => samplePath(p, spacing));
    setPoints(all);
  }, [paths, spacing]);

  // Compute height from viewBox aspect ratio
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
  const height = (size * (vbH || 1)) / (vbW || 1);

  const filterId = glow ? `dotted-path-glow-${paths.join("-").length}` : undefined;

  return (
    <svg
      className={className}
      width={size}
      height={height}
      viewBox={viewBox}
      fill={color}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      shapeRendering="geometricPrecision"
    >
      {glow && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={dotRadius * 0.4} />
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
      <g filter={glow ? `url(#${filterId})` : undefined}>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={dotRadius} />
        ))}
      </g>
    </svg>
  );
};
