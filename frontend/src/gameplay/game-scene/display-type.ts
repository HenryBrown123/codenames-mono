export type DisplayType = "mobile" | "windowed" | "desktop";

export const DISPLAY_BREAKPOINTS = {
  /** Both conditions must be true for desktop layout */
  DESKTOP_MIN_WIDTH: 1000,
  DESKTOP_MIN_HEIGHT: 800,
  WINDOW_MIN_HEIGHT: 700,
  /** Short edge (min of width/height) below this → mobile overlays */
  MOBILE_MAX_SHORT_EDGE: 500,
} as const;

export const getDisplayType = (): DisplayType => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const shortEdge = Math.min(w, h);

  // True desktop — enough room for sidebar + board without scrolling
  if (w >= DISPLAY_BREAKPOINTS.DESKTOP_MIN_WIDTH && h >= DISPLAY_BREAKPOINTS.DESKTOP_MIN_HEIGHT) {
    return "desktop";
  }

  if (h >= DISPLAY_BREAKPOINTS.WINDOW_MIN_HEIGHT) {
    return "windowed";
  }

  return "mobile";
};
