import { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import styles from "./ar-circle-overlay.module.css";

// ── Constants ─────────────────────────────────────────────────────────────────

// Fixed pixel radius — doesn't scale with overlay size
const CIRCLE_RADIUS_DESKTOP = 750;
const CIRCLE_RADIUS_MOBILE = 1500;
const BLEED_PX = 500;

// Breakpoint for desktop (matches CSS media query)
const DESKTOP_BREAKPOINT = 769;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build variants with a pixel-based origin so Framer Motion can interpolate cleanly (no calc). */
function makeVariants(originX: string, originY: string, radius: number): Variants {
  return {
    hidden: {
      clipPath: `circle(0px at ${originX} ${originY})`,
      transition: { duration: 2, ease: [0.55, 0, 1, 0.45] },
    },
    visible: {
      clipPath: `circle(${radius}px at ${originX} ${originY})`,
      transition: { duration: 2, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      clipPath: `circle(0px at ${originX} ${originY})`,
      transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
    },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ARCircleOverlayProps {
  children: React.ReactNode;
}

/**
 * Clips children to an expanding circle with a teal vignette and glare sweep.
 * Mount/unmount controls lifecycle — wrap in AnimatePresence for exit animation.
 *
 * The overlay extends beyond the board (--ar-bleed) so the circle isn't
 * trimmed at the board edges. Children are placed in a .cardContainer
 * that maps back to the exact board bounds.
 *
 * Desktop: circle expands from center (50% 50%)
 * Mobile/windowed: circle expands from the board's bottom-right corner
 */
export const ARCircleOverlay = memo<ARCircleOverlayProps>(({
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT
  );

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // For center: 50% 50% always maps to the board center (symmetric bleed).
  // For corner: compute the board's bottom-right within the extended overlay.
  const getVariants = useCallback((): Variants => {
    if (isDesktop) {
      return makeVariants("50%", "50%", CIRCLE_RADIUS_DESKTOP);
    }
    // Corner: board's bottom-right = overlay size - bleed
    const el = ref.current;
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      const x = width - BLEED_PX;
      const y = height - BLEED_PX;
      return makeVariants(`${x}px`, `${y}px`, CIRCLE_RADIUS_MOBILE);
    }
    // Fallback before measurement
    return makeVariants("50%", "50%", CIRCLE_RADIUS_MOBILE);
  }, [isDesktop]);

  const variants = getVariants();

  return (
    <motion.div
      ref={ref}
      className={styles.overlay}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.cardContainer}>
        {children}
      </div>
      <div className={styles.vignette} />
      <div className={styles.glare} />
    </motion.div>
  );
});

ARCircleOverlay.displayName = "ARCircleOverlay";
