import { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { useDisplayType } from "../../layout/use-display-type";
import styles from "./ar-circle-overlay.module.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const CIRCLE_RADIUS_DESKTOP = 850;
const CIRCLE_RADIUS_MOBILE = 1500;
/** Must match --ar-bleed in ar-circle-overlay.module.css */
const BLEED_PX = 500;

/** Velocity threshold (px/s) — fast flick snaps even if < 50%. */
const VELOCITY_THRESHOLD = 500;

// ── Spring configs ────────────────────────────────────────────────────────────

const SPRING_SNAP = { type: "spring" as const, stiffness: 300, damping: 30 };
const SPRING_TOGGLE = { type: "spring" as const, stiffness: 80, damping: 20 };
const SPRING_RETURN = { type: "spring" as const, stiffness: 200, damping: 25 };

// ── Geometry ──────────────────────────────────────────────────────────────────

type DesktopPositions = {
  mode: "slide";
  radius: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dragZoneCorner: "bottomLeft";
};

type MobilePositions = {
  mode: "expand";
  maxRadius: number;
  /** Fixed clip-path center (board's bottom-right corner in overlay-space). */
  cx: number;
  cy: number;
  dragZoneCorner: "bottomRight";
};

type Positions = DesktopPositions | MobilePositions;

function computePositions(
  displayType: string,
  overlayWidth: number,
  overlayHeight: number,
  /** FAB button center in overlay-space (measured at runtime). */
  fabCenter?: { x: number; y: number },
): Positions {
  if (displayType === "desktop") {
    const radius = CIRCLE_RADIUS_DESKTOP;
    const endX = Math.round(overlayWidth / 2);
    const endY = Math.round(overlayHeight / 2);
    return {
      mode: "slide",
      radius,
      startX: -radius,
      startY: overlayHeight + radius,
      endX,
      endY,
      dragZoneCorner: "bottomLeft",
    };
  }

  // Windowed & mobile: radius expands from the AR FAB dot.
  // Use measured FAB center for pixel-perfect alignment, with fallback.
  const fallbackX = overlayWidth - BLEED_PX - 38;
  const fallbackY = overlayHeight - BLEED_PX - 38;
  const fabCx = fabCenter ? Math.round(fabCenter.x) : fallbackX;
  const fabCy = fabCenter ? Math.round(fabCenter.y) : fallbackY;
  // maxRadius must reach the furthest corner from the FAB center
  const maxRadius = Math.ceil(Math.sqrt(fabCx ** 2 + fabCy ** 2));
  return {
    mode: "expand",
    maxRadius,
    cx: fabCx,
    cy: fabCy,
    dragZoneCorner: "bottomRight",
  };
}

// ── Public component ──────────────────────────────────────────────────────────

interface ARCircleOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Circle lens that reveals spymaster-coloured cards.
 *
 * Desktop: clip-path position slides from bottom-left to center.
 * Mobile/windowed: clip-path radius expands from bottom-right corner.
 *
 * Both modes support a corner drag zone for swipe-to-reveal,
 * the toggle button, and freeform drag when open (desktop only).
 */
export const ARCircleOverlay = memo<ARCircleOverlayProps>(({ children, isOpen, onOpenChange }) => {
  const displayType = useDisplayType();
  const [positions, setPositions] = useState<Positions | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Ref callback — attaches to a persistent hidden div for measurement
  const setMeasureRef = useCallback(
    (node: HTMLDivElement | null) => {
      (measureRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [],
  );

  // Measure on mount + resize via ResizeObserver
  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const measure = () => {
      const overlayRect = node.getBoundingClientRect();
      if (overlayRect.width <= 0 || overlayRect.height <= 0) return;

      // Find the FAB button and compute its center relative to the overlay
      const fab = document.querySelector("[data-ar-fab]");
      let fabCenter: { x: number; y: number } | undefined;
      if (fab) {
        const fabRect = fab.getBoundingClientRect();
        fabCenter = {
          x: fabRect.left + fabRect.width / 2 - overlayRect.left,
          y: fabRect.top + fabRect.height / 2 - overlayRect.top,
        };
      }

      setPositions(computePositions(displayType, overlayRect.width, overlayRect.height, fabCenter));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [displayType]);

  // Always render a hidden measurement div — it tracks overlay size
  const lens = positions
    ? positions.mode === "expand"
      ? <ExpandLens positions={positions} isOpen={isOpen} onOpenChange={onOpenChange}>{children}</ExpandLens>
      : <SlideLens positions={positions} isOpen={isOpen} onOpenChange={onOpenChange}>{children}</SlideLens>
    : null;

  return (
    <>
      {/* Hidden measurement div — always mounted, tracks overlay size */}
      <div
        ref={setMeasureRef}
        className={styles.overlay}
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      {lens}
    </>
  );
});

ARCircleOverlay.displayName = "ARCircleOverlay";

// ── Desktop: slide lens (position animates, radius fixed) ─────────────────────

interface SlideLensProps {
  positions: DesktopPositions;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const SlideLens = memo<SlideLensProps>(({ positions, isOpen, onOpenChange, children }) => {
  const { radius, startX, startY, endX, endY, dragZoneCorner } = positions;

  const cx = useMotionValue(isOpen ? endX : startX);
  const cy = useMotionValue(isOpen ? endY : startY);
  const clipPath = useMotionTemplate`circle(${radius}px at ${cx}px ${cy}px)`;

  // Keep motion values in sync when positions change (e.g. resize)
  useEffect(() => {
    if (isOpen) {
      cx.set(endX);
      cy.set(endY);
    } else {
      cx.set(startX);
      cy.set(startY);
    }
  }, [cx, cy, endX, endY, startX, startY, isOpen]);

  // ── Drag zone → clip-path mapping (1:1 clamped) ────────────────────────
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const dragTravelX = endX - startX;
  const dragTravelY = endY - startY;

  const clampX = dragTravelX < 0
    ? (v: number) => Math.max(endX, Math.min(startX, v))
    : (v: number) => Math.min(endX, Math.max(startX, v));
  const clampY = dragTravelY < 0
    ? (v: number) => Math.max(endY, Math.min(startY, v))
    : (v: number) => Math.min(endY, Math.max(startY, v));

  const dragCx = useTransform(dragX, (dx) => clampX(startX + dx));
  const dragCy = useTransform(dragY, (dy) => clampY(startY + dy));

  const unsubX = useRef<(() => void) | null>(null);
  const unsubY = useRef<(() => void) | null>(null);

  const startDragSync = useCallback(() => {
    dragX.set(cx.get() - startX);
    dragY.set(cy.get() - startY);
    unsubX.current = dragCx.on("change", (v) => cx.set(v));
    unsubY.current = dragCy.on("change", (v) => cy.set(v));
  }, [cx, cy, dragX, dragY, dragCx, dragCy, startX, startY]);

  const stopDragSync = useCallback(() => {
    unsubX.current?.();
    unsubY.current?.();
    unsubX.current = null;
    unsubY.current = null;
  }, []);

  // ── Animation helpers ─────────────────────────────────────────────────
  const animateTo = useCallback(
    (open: boolean, spring: typeof SPRING_SNAP) => {
      stopDragSync();
      animate(cx, open ? endX : startX, spring);
      animate(cy, open ? endY : startY, spring);
      animate(dragX, 0, spring);
      animate(dragY, 0, spring);
      onOpenChange(open);
    },
    [cx, cy, dragX, dragY, startX, startY, endX, endY, onOpenChange, stopDragSync],
  );

  const snapTo = useCallback((open: boolean) => animateTo(open, SPRING_SNAP), [animateTo]);
  const toggleTo = useCallback((open: boolean) => animateTo(open, SPRING_TOGGLE), [animateTo]);

  // ── Sync with external toggle ─────────────────────────────────────────
  const prevOpen = useRef(isOpen);
  if (prevOpen.current !== isOpen) {
    prevOpen.current = isOpen;
    toggleTo(isOpen);
  }

  // ── Drag zone handlers ────────────────────────────────────────────────
  const handleDragStart = useCallback(() => startDragSync(), [startDragSync]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.sqrt(dragX.get() ** 2 + dragY.get() ** 2) < 5) {
        snapTo(!isOpen);
        return;
      }
      const totalDist = Math.sqrt(dragTravelX ** 2 + dragTravelY ** 2);
      const dx = cx.get() - startX;
      const dy = cy.get() - startY;
      const progress = totalDist > 0 ? Math.sqrt(dx ** 2 + dy ** 2) / totalDist : 0;
      const speed = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
      const dot = info.velocity.x * (startX - cx.get()) + info.velocity.y * (startY - cy.get());

      if (dot > 0 && speed > VELOCITY_THRESHOLD) snapTo(false);
      else if (dot < 0 && speed > VELOCITY_THRESHOLD) snapTo(true);
      else snapTo(progress > 0.5);
    },
    [cx, cy, dragX, dragY, startX, startY, dragTravelX, dragTravelY, snapTo, isOpen],
  );

  // ── Freeform drag when open ───────────────────────────────────────────
  const freeDrag = useRef<{ px: number; py: number; cx0: number; cy0: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isOpen) return;
      freeDrag.current = { px: e.clientX, py: e.clientY, cx0: cx.get(), cy0: cy.get() };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isOpen, cx, cy],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!freeDrag.current) return;
      cx.set(freeDrag.current.cx0 + (e.clientX - freeDrag.current.px));
      cy.set(freeDrag.current.cy0 + (e.clientY - freeDrag.current.py));
    },
    [cx, cy],
  );

  const onPointerEnd = useCallback(() => {
    if (!freeDrag.current) return;
    freeDrag.current = null;
    animate(cx, endX, SPRING_RETURN);
    animate(cy, endY, SPRING_RETURN);
  }, [cx, cy, endX, endY]);

  return (
    <>
      <motion.div
        className={styles.overlay}
        style={{
          clipPath,
          cursor: isOpen ? "grab" : undefined,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className={styles.cardContainer} style={{ pointerEvents: "none" }}>
          {children}
        </div>
        <div className={styles.glare} />
      </motion.div>

      <motion.div
        className={`${styles.dragZone} ${styles[dragZoneCorner]}`}
        style={{ x: dragX, y: dragY }}
        drag
        dragMomentum={false}
        dragElastic={0.15}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTap={() => toggleTo(!isOpen)}
      />
    </>
  );
});

SlideLens.displayName = "SlideLens";

// ── Mobile/windowed: expand lens (radius animates, center fixed) ──────────────

interface ExpandLensProps {
  positions: MobilePositions;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const ExpandLens = memo<ExpandLensProps>(({ positions, isOpen, onOpenChange, children }) => {
  const { maxRadius, cx: centerX, cy: centerY, dragZoneCorner } = positions;

  const r = useMotionValue(isOpen ? maxRadius : 0);
  const clipPath = useMotionTemplate`circle(${r}px at ${centerX}px ${centerY}px)`;

  // Keep radius in sync when positions change (e.g. resize)
  useEffect(() => {
    r.set(isOpen ? maxRadius : 0);
  }, [r, maxRadius, isOpen]);

  // ── Animation helpers ─────────────────────────────────────────────────
  // Signal the FAB dot when animation completes so it can start blinking
  const setFabAnimating = useCallback((animating: boolean) => {
    const fab = document.querySelector("[data-ar-fab]");
    if (fab) fab.setAttribute("data-ar-animating", String(animating));
  }, []);

  /** Snap with initial velocity (px/s) for momentum — gives the "push" feel. */
  const snapTo = useCallback(
    (open: boolean, velocity = 0) => {
      setFabAnimating(true);
      const anim = animate(r, open ? maxRadius : 0, { ...SPRING_SNAP, velocity });
      anim.then(() => setFabAnimating(false));
      onOpenChange(open);
    },
    [r, maxRadius, onOpenChange, setFabAnimating],
  );

  const toggleTo = useCallback(
    (open: boolean) => {
      setFabAnimating(true);
      const anim = animate(r, open ? maxRadius : 0, SPRING_TOGGLE);
      anim.then(() => setFabAnimating(false));
      onOpenChange(open);
    },
    [r, maxRadius, onOpenChange, setFabAnimating],
  );

  // ── Sync with external toggle ─────────────────────────────────────────
  const prevOpen = useRef(isOpen);
  if (prevOpen.current !== isOpen) {
    prevOpen.current = isOpen;
    toggleTo(isOpen);
  }

  // ── Pinned drag — radius = distance from finger to circle center ──────
  // Works on both the overlay (when open) and the drag zone (when closed).
  // The circle edge tracks your finger exactly.
  const overlayRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  // Velocity tracking — store last two radius samples with timestamps
  const lastSamples = useRef<{ r: number; t: number }[]>([]);

  const getRadiusFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = overlayRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      // Touch layer is in board-space; centerX/centerY are in overlay-space.
      // Convert by subtracting BLEED_PX offset.
      const bx = clientX - rect.left;
      const by = clientY - rect.top;
      const cx = centerX - BLEED_PX;
      const cy = centerY - BLEED_PX;
      return Math.max(0, Math.min(maxRadius, Math.sqrt(
        (bx - cx) ** 2 + (by - cy) ** 2,
      )));
    },
    [centerX, centerY, maxRadius],
  );

  const trackSample = useCallback((radius: number) => {
    const now = performance.now();
    lastSamples.current.push({ r: radius, t: now });
    // Keep only last 3 samples
    if (lastSamples.current.length > 3) lastSamples.current.shift();
  }, []);

  /** Radius velocity in px/s (positive = expanding, negative = shrinking). */
  const getVelocity = useCallback(() => {
    const samples = lastSamples.current;
    if (samples.length < 2) return 0;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = (last.t - first.t) / 1000; // seconds
    if (dt < 0.001) return 0;
    return (last.r - first.r) / dt;
  }, []);

  // On pointer down: spring the radius toward the finger distance.
  // Once caught up, switch to 1:1 direct tracking.
  const catchUpAnim = useRef<ReturnType<typeof animate> | null>(null);
  const caughtUp = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      caughtUp.current = false;
      lastSamples.current = [];
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const fingerR = getRadiusFromPointer(e.clientX, e.clientY);
      trackSample(fingerR);
      catchUpAnim.current?.stop();
      catchUpAnim.current = animate(r, fingerR, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        onUpdate: (v) => {
          // Check if we've caught up to the current finger position
          if (Math.abs(v - fingerR) < 20) {
            caughtUp.current = true;
            catchUpAnim.current?.stop();
            catchUpAnim.current = null;
          }
        },
      });
    },
    [r, getRadiusFromPointer, trackSample],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const fingerR = getRadiusFromPointer(e.clientX, e.clientY);
      trackSample(fingerR);

      if (caughtUp.current) {
        // Direct 1:1 tracking — pinned to finger
        r.set(fingerR);
      } else {
        // Still catching up — retarget the spring
        catchUpAnim.current?.stop();
        catchUpAnim.current = animate(r, fingerR, {
          type: "spring",
          stiffness: 300,
          damping: 30,
          onUpdate: (v) => {
            if (Math.abs(v - fingerR) < 20) {
              caughtUp.current = true;
              catchUpAnim.current?.stop();
              catchUpAnim.current = null;
            }
          },
        });
      }
    },
    [r, getRadiusFromPointer, trackSample],
  );

  const onPointerEnd = useCallback(
    () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const progress = maxRadius > 0 ? r.get() / maxRadius : 0;
      const velocity = getVelocity(); // px/s

      // Fast flick overrides position threshold
      const shouldOpen = Math.abs(velocity) > VELOCITY_THRESHOLD
        ? velocity > 0 // positive = expanding = open
        : progress > 0.5;

      // Pass velocity to spring — it'll coast before settling
      snapTo(shouldOpen, velocity);
    },
    [r, maxRadius, snapTo, getVelocity],
  );

  return (
    <>
      {/* Visual overlay — clipped to the circle */}
      <motion.div
        className={styles.overlay}
        style={{ clipPath, pointerEvents: "none" }}
      >
        <div className={styles.cardContainer} style={{ pointerEvents: "none" }}>
          {children}
        </div>
        <div className={styles.glare} />
      </motion.div>

      {/* Touch layer — covers entire board, always interactive, no clip-path.
          overlayRef is here so getRadiusFromPointer uses correct coordinate space. */}
      <div
        ref={overlayRef}
        className={styles.touchLayer}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      />
    </>
  );
});

ExpandLens.displayName = "ExpandLens";
