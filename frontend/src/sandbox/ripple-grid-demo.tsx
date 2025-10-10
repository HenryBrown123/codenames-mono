import React, { useState, useMemo, useCallback } from "react";
import {
  AnimationEngineProvider,
  useAnimationEngine,
} from "../gameplay/animations/animation-engine-context";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import type { AnimationDefinition } from "../gameplay/animations/animation-types";
import { DevToolsPanel } from "../gameplay/animations/animation-devtools";
import { useLayoutEffect } from "react";

const GRID_SIZE = 16;
const TILE_SIZE = 24;
const TILE_GAP = 4;

interface TileState {
  id: string;
  x: number;
  y: number;
  isPending: boolean;
  isActive: boolean;
}

interface PendingAnimation {
  tileIds: string[];
  clickX: number;
  clickY: number;
}

const tileAnimations: Record<string, AnimationDefinition> = {
  ripple: {
    keyframes: [
      {
        transform: "scale(0)",
        opacity: "0",
        filter: "blur(4px)",
      },
      {
        transform: "scale(1.2)",
        opacity: "1",
        filter: "blur(0px)",
      },
      {
        transform: "scale(1)",
        opacity: "1",
        filter: "blur(0px)",
      },
    ],
    options: {
      duration: 600,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both",
    },
  },
};

const glowAnimations: Record<string, AnimationDefinition> = {
  ripple: {
    keyframes: [
      {
        opacity: "0",
        transform: "scale(0.3)",
        filter: "blur(8px)",
      },
      {
        opacity: "0.8",
        transform: "scale(2)",
        filter: "blur(12px)",
      },
      {
        opacity: "0",
        transform: "scale(3)",
        filter: "blur(16px)",
      },
    ],
    options: {
      duration: 800,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both",
    },
  },
};

/**
 * Coordinator hook that bridges state and animation engine
 */
function useRippleCoordinator(
  pending: PendingAnimation | null,
  tiles: Map<string, TileState>,
  onComplete: () => void,
) {
  const engine = useAnimationEngine();

  useLayoutEffect(() => {
    if (!pending) return;

    const transitions = new Map(pending.tileIds.map((id) => [id, { event: "ripple" }]));

    const getIndex = (tileId: string) => {
      const tile = tiles.get(tileId);
      if (!tile) return 0;

      const tileCenterX = tile.x + TILE_SIZE / 2;
      const tileCenterY = tile.y + TILE_SIZE / 2;

      const dx = tileCenterX - pending.clickX;
      const dy = tileCenterY - pending.clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return Math.floor(distance / 30);
    };

    engine.playTransitions(transitions, getIndex).then(onComplete);
  }, [pending, tiles, engine, onComplete]);
}

/**
 * Individual pixel tile component
 */
const PixelTile: React.FC<{
  tile: TileState;
}> = ({ tile }) => {
  const { createAnimationRef } = useAnimationRegistration(tile.id, {
    x: tile.x,
    y: tile.y,
    isActive: tile.isActive,
  });

  const hue = (tile.x + tile.y) % 360;

  return (
    <div
      ref={createAnimationRef("container", tileAnimations)}
      style={{
        position: "absolute",
        left: tile.x,
        top: tile.y,
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: "50%",
        background: tile.isActive ? `hsl(${hue}, 85%, 65%)` : "rgba(100, 100, 120, 0.15)",
        boxShadow: tile.isActive
          ? `0 0 12px hsla(${hue}, 85%, 65%, 0.6), inset 0 0 8px hsla(${hue}, 85%, 85%, 0.4)`
          : "none",
        transformOrigin: "center",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div
        ref={createAnimationRef("glow", glowAnimations)}
        style={{
          position: "absolute",
          inset: "-8px",
          background: `radial-gradient(circle, hsla(${hue}, 85%, 65%, 0.4) 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/**
 * Main demo component with pixel grid
 */
const RippleGridDemo: React.FC = () => {
  const [tiles, setTiles] = useState<Map<string, TileState>>(() => {
    const initial = new Map<string, TileState>();
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = `tile-${row * GRID_SIZE + col}`;
        initial.set(id, {
          id,
          x: col * (TILE_SIZE + TILE_GAP) + 20,
          y: row * (TILE_SIZE + TILE_GAP) + 20,
          isPending: false,
          isActive: false,
        });
      }
    }
    return initial;
  });

  const [pending, setPending] = useState<PendingAnimation | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const tileIds = Array.from(tiles.keys());

      setTiles((prev) => {
        const next = new Map(prev);
        tileIds.forEach((id) => {
          const tile = next.get(id)!;
          next.set(id, { ...tile, isPending: true, isActive: false });
        });
        return next;
      });

      setPending({ tileIds, clickX, clickY });
    },
    [tiles],
  );

  const handleComplete = useCallback(() => {
    setTiles((prev) => {
      const next = new Map(prev);
      pending?.tileIds.forEach((id) => {
        const tile = next.get(id)!;
        next.set(id, { ...tile, isPending: false, isActive: true });
      });
      return next;
    });
    setPending(null);
  }, [pending]);

  const handleReset = useCallback(() => {
    setTiles((prev) => {
      const next = new Map(prev);
      next.forEach((tile, id) => {
        next.set(id, { ...tile, isActive: false });
      });
      return next;
    });
  }, []);

  useRippleCoordinator(pending, tiles, handleComplete);

  const gridWidth = GRID_SIZE * (TILE_SIZE + TILE_GAP) + 40;
  const gridHeight = GRID_SIZE * (TILE_SIZE + TILE_GAP) + 40;

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2
          style={{
            color: "#fff",
            marginBottom: "0.5rem",
            fontSize: "2rem",
            fontWeight: "300",
            letterSpacing: "0.05em",
          }}
        >
          Ripple Animation
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          Click anywhere to create a ripple effect
        </p>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
          <button
            onClick={handleReset}
            disabled={pending !== null}
            style={{
              padding: "0.6rem 1.5rem",
              background: pending ? "rgba(100, 100, 120, 0.2)" : "rgba(255, 255, 255, 0.1)",
              color: pending ? "rgba(255, 255, 255, 0.3)" : "#fff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              cursor: pending ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              backdropFilter: "blur(10px)",
            }}
          >
            Reset
          </button>
          <span
            style={{
              color: pending ? "rgba(100, 200, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            {pending ? "● Animating" : "○ Ready"}
          </span>
        </div>
        <div
          onClick={handleClick}
          style={{
            position: "relative",
            width: gridWidth,
            height: gridHeight,
            background:
              "linear-gradient(135deg, rgba(15, 15, 25, 0.9) 0%, rgba(25, 15, 35, 0.9) 100%)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            cursor: "crosshair",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          {Array.from(tiles.values()).map((tile) => (
            <PixelTile key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper component with animation engine provider
 */
export const RippleGridDemoWrapper: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="ripple-demo">
      <RippleGridDemo />
      <DevToolsPanel position="bottom-right" defaultOpen={false} theme="dark" />
    </AnimationEngineProvider>
  );
};

export default RippleGridDemoWrapper;
