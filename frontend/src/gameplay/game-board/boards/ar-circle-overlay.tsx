import { memo, useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import styles from "./ar-circle-overlay.module.css";

// ── Variants ──────────────────────────────────────────────────────────────────

// Desktop: circle expands from center
const clipVariantsCenter: Variants = {
  hidden: {
    clipPath: "circle(0% at 50% 50%)",
    transition: { duration: 0.65, ease: [0.55, 0, 1, 0.45] },
  },
  visible: {
    clipPath: "circle(150% at 50% 50%)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Mobile/windowed: circle expands from bottom-right corner
const clipVariantsCorner: Variants = {
  hidden: {
    clipPath: "circle(0% at 100% 100%)",
    transition: { duration: 0.65, ease: [0.55, 0, 1, 0.45] },
  },
  visible: {
    clipPath: "circle(150% at 100% 100%)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Breakpoint for desktop (matches CSS media query)
const DESKTOP_BREAKPOINT = 769;

// ── Component ─────────────────────────────────────────────────────────────────

interface ARCircleOverlayProps {
  isOn: boolean;
  children: React.ReactNode;
}

/**
 * Clips children to an expanding circle with a teal vignette and glare sweep.
 *
 * Desktop: circle expands from center
 * Mobile/windowed: circle expands from bottom-right corner
 */
export const ARCircleOverlay = memo<ARCircleOverlayProps>(({
  isOn,
  children,
}) => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT
  );

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const animateState = isOn ? "visible" : "hidden";
  const variants = isDesktop ? clipVariantsCenter : clipVariantsCorner;

  return (
    <div className={styles.root}>
      <motion.div
        className={styles.clipLayer}
        variants={variants}
        animate={animateState}
      >
        {children}
        <div className={styles.vignette} />
        <div className={styles.glare} />
      </motion.div>
    </div>
  );
});

ARCircleOverlay.displayName = "ARCircleOverlay";
