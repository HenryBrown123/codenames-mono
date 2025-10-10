import React, { useState, useCallback } from "react";
import {
  AnimationEngineProvider,
  useAnimationEngine,
} from "../gameplay/animations/animation-engine-context";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import type {
  AnimationDefinition,
  AnimationDefinitionStatic,
} from "../gameplay/animations/animation-types";
import { DevToolsPanel } from "../gameplay/animations/animation-devtools";
import { useLayoutEffect } from "react";

interface BallState {
  isPending: boolean;
  height: number;
  time: number;
}

interface PendingAnimation {
  animationType: string;
}

const createBallAnimation = (height: number, time: number): AnimationDefinitionStatic => ({
  keyframes: [
    { transform: "translateY(0) scaleY(1) scaleX(1)", offset: 0 },
    { transform: "translateY(0) scaleY(0.8) scaleX(1.2)", offset: 0.05 },
    { transform: `translateY(-${height}px) scaleY(1.1) scaleX(0.9)`, offset: 0.3 },
    { transform: `translateY(-${height}px) scaleY(1) scaleX(1)`, offset: 0.5 },
    { transform: "translateY(0) scaleY(0.8) scaleX(1.2)", offset: 0.95 },
    { transform: "translateY(0) scaleY(1) scaleX(1)", offset: 1 },
  ],
  options: {
    duration: time,
    easing: "linear",
    fill: "both",
  },
});

const createShadowAnimation = (height: number, time: number): AnimationDefinitionStatic => {
  const minScale = Math.max(0.2, 1 - height / 250);
  const minOpacity = Math.max(0.1, 0.7 - height / 300);

  return {
    keyframes: [
      { transform: "scale(1) translateY(0)", opacity: "0.7", offset: 0 },
      {
        transform: `scale(${minScale}) translateY(-${height * 0.15}px)`,
        opacity: `${minOpacity}`,
        offset: 0.3,
      },
      {
        transform: `scale(${minScale}) translateY(-${height * 0.15}px)`,
        opacity: `${minOpacity}`,
        offset: 0.5,
      },
      { transform: "scale(1) translateY(0)", opacity: "0.7", offset: 0.95 },
      { transform: "scale(1) translateY(0)", opacity: "0.7", offset: 1 },
    ],
    options: {
      duration: time,
      easing: "linear",
      fill: "both",
    },
  };
};

/**
 * Coordinator hook for ball animations
 */
function useBallCoordinator(pending: PendingAnimation | null, onComplete: () => void) {
  const engine = useAnimationEngine();

  useLayoutEffect(() => {
    if (!pending) return;

    const transitions = new Map([["ball-entity", { event: pending.animationType }]]);

    engine.playTransitions(transitions).then(onComplete);
  }, [pending, engine, onComplete]);
}

/**
 * Ball component with shadow - single entity, two animated elements
 */
const BouncingBall: React.FC<{
  state: BallState;
}> = ({ state }) => {
  // Define animation functions that resolve at runtime
  const ballAnimations = React.useMemo(
    () => ({
      bounce: ((context: Record<string, unknown>): AnimationDefinitionStatic => {
        const height = (context.height as number) || 200;
        const time = (context.time as number) || 1200;

        return createBallAnimation(height, time);
      }) as unknown as AnimationDefinition,
    }),
    [],
  );

  const shadowAnimations = React.useMemo(
    () => ({
      bounce: ((context: Record<string, unknown>): AnimationDefinitionStatic => {
        const height = (context.height as number) || 200;
        const time = (context.time as number) || 1200;

        return createShadowAnimation(height, time);
      }) as unknown as AnimationDefinition,
    }),
    [],
  );

  // Entity context that will be passed to animation functions
  const entityContext = React.useMemo(
    () => ({
      height: state.height,
      time: state.time,
      isPending: state.isPending,
    }),
    [state.height, state.time, state.isPending],
  );

  const { createAnimationRef } = useAnimationRegistration("ball-entity", entityContext);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "250px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        ref={createAnimationRef("shadow", shadowAnimations)}
        style={{
          position: "absolute",
          bottom: "-5px",
          left: "50%",
          marginLeft: "-60px",
          width: "120px",
          height: "30px",
          background:
            "radial-gradient(ellipse, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.45) 40%, rgba(0, 0, 0, 0.15) 70%, transparent 90%)",
          borderRadius: "50%",
          filter: "blur(3px)",
          transformOrigin: "center top",
        }}
      />

      <div
        ref={createAnimationRef("ball", ballAnimations)}
        style={{
          position: "absolute",
          bottom: "0px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)",
          boxShadow:
            "0 10px 30px rgba(238, 90, 111, 0.3), inset -10px -10px 20px rgba(0, 0, 0, 0.15), inset 10px 10px 20px rgba(255, 255, 255, 0.4)",
          transformOrigin: "center bottom",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), transparent)",
            filter: "blur(2px)",
          }}
        />
      </div>
    </div>
  );
};

/**
 * Main demo component
 */
const BouncingBallDemo: React.FC = () => {
  const [ballState, setBallState] = useState<BallState>({
    isPending: false,
    height: 150,
    time: 1000,
  });

  const [pending, setPending] = useState<PendingAnimation | null>(null);

  const handleBounce = useCallback(() => {
    setBallState((prev) => ({
      ...prev,
      isPending: true,
    }));
    setPending({ animationType: "bounce" });
  }, []);

  const handleComplete = useCallback(() => {
    setBallState((prev) => ({
      ...prev,
      isPending: false,
    }));
    setPending(null);
  }, []);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBallState((prev) => ({
      ...prev,
      height: Number(e.target.value),
    }));
  }, []);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBallState((prev) => ({
      ...prev,
      time: Number(e.target.value),
    }));
  }, []);

  useBallCoordinator(pending, handleComplete);

  return (
    <div style={{ padding: "1.5rem", minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h2
          style={{
            color: "#333",
            marginBottom: "0.25rem",
            fontSize: "1.5rem",
            fontWeight: "300",
            letterSpacing: "0.05em",
          }}
        >
          Bouncing Ball
        </h2>
        <p
          style={{
            color: "#666",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          Dynamic animations via entity context - adjust sliders then bounce
        </p>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <BouncingBall state={ballState} />
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.4rem",
              }}
            >
              <label
                style={{
                  color: "#333",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                }}
              >
                Height
              </label>
              <span
                style={{
                  color: "#666",
                  fontSize: "0.8rem",
                }}
              >
                {ballState.height}px
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={ballState.height}
              onChange={handleHeightChange}
              disabled={pending !== null}
              style={{
                width: "100%",
                height: "5px",
                borderRadius: "3px",
                background: "linear-gradient(to right, #667eea, #764ba2)",
                outline: "none",
                opacity: pending ? 0.5 : 1,
                cursor: pending ? "not-allowed" : "pointer",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.4rem",
              }}
            >
              <label
                style={{
                  color: "#333",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                }}
              >
                Time
              </label>
              <span
                style={{
                  color: "#666",
                  fontSize: "0.8rem",
                }}
              >
                {ballState.time}ms
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="100"
              value={ballState.time}
              onChange={handleTimeChange}
              disabled={pending !== null}
              style={{
                width: "100%",
                height: "5px",
                borderRadius: "3px",
                background: "linear-gradient(to right, #f093fb, #f5576c)",
                outline: "none",
                opacity: pending ? 0.5 : 1,
                cursor: pending ? "not-allowed" : "pointer",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={handleBounce}
            disabled={pending !== null}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: pending
                ? "rgba(200, 200, 200, 0.3)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: pending ? "rgba(0, 0, 0, 0.3)" : "#fff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "10px",
              cursor: pending ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              boxShadow: pending ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)",
              transform: pending ? "scale(0.98)" : "scale(1)",
            }}
          >
            {pending ? "Bouncing..." : "Bounce!"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              background: "rgba(0, 0, 0, 0.04)",
              borderRadius: "10px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <span
              style={{
                color: pending ? "#667eea" : "#999",
                fontSize: "0.8rem",
                fontWeight: "500",
              }}
            >
              {pending ? "● Animating" : "○ Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper component with animation engine provider
 */
export const BouncingBallDemoWrapper: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="ball-demo">
      <BouncingBallDemo />
      <DevToolsPanel position="bottom-right" defaultOpen={false} theme="light" />
    </AnimationEngineProvider>
  );
};
export default BouncingBallDemoWrapper;
