import React, { useEffect, useState } from "react";
import { AnimationEngineProvider, useAnimationEngine } from "../gameplay/animations/animation-engine-context";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import { VISUALIZER_MODES } from "../gameplay/animations/spring-animation";
import type { SpringAnimationDefinition } from "../gameplay/animations/animation-types";

const BAR_COUNT = 8;

const BouncyBar: React.FC<{ barId: string; mode: keyof typeof VISUALIZER_MODES }> = ({
  barId,
  mode,
}) => {
  const { createAnimationRef } = useAnimationRegistration(barId);

  const animations: Record<string, SpringAnimationDefinition> = {
    bounce: {
      keyframes: [{ transform: "scaleY(0.2)" }, { transform: "scaleY(1)" }],
      springConfig: VISUALIZER_MODES[mode],
      options: { duration: 1000 },
      trackContext: (context) => (context.target as number) ?? 0.2,
    },
  };

  return (
    <div
      style={{
        width: "40px",
        height: "200px",
        margin: "0 5px",
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        ref={createAnimationRef("bar", animations)}
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(to top, #00ff88, #00ffff)",
          transformOrigin: "bottom",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

const SpringTestInner: React.FC = () => {
  const engine = useAnimationEngine();
  const [mode, setMode] = useState<keyof typeof VISUALIZER_MODES>("bouncy");
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(2000);

  useEffect(() => {
    engine.startSpringLoop();
    return () => engine.stopSpringLoop();
  }, [engine]);

  // Manual random targets
  const setRandomTargets = () => {
    for (let i = 0; i < BAR_COUNT; i++) {
      const target = Math.random();
      engine.updateEntityContext(`test-bar-${i}`, { target });
    }
  };

  // Auto update at interval
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      setRandomTargets();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, engine]);

  // Set specific target for testing
  const setAllTargets = (value: number) => {
    for (let i = 0; i < BAR_COUNT; i++) {
      engine.updateEntityContext(`test-bar-${i}`, { target: value });
    }
  };

  return (
    <div style={{ padding: "40px", background: "#1a1a1a", minHeight: "100vh" }}>
      <h1 style={{ color: "white", marginBottom: "20px" }}>Spring Physics Test</h1>

      {/* Controls */}
      <div
        style={{
          background: "#2a2a2a",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          color: "white",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Spring Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as keyof typeof VISUALIZER_MODES)}
            style={{ padding: "8px", fontSize: "14px" }}
          >
            {Object.keys(VISUALIZER_MODES).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Auto Update Interval: {updateInterval}ms
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setAutoUpdate(!autoUpdate)} style={{ padding: "10px 20px" }}>
            {autoUpdate ? "Stop Auto Update" : "Start Auto Update"}
          </button>
          <button onClick={setRandomTargets} style={{ padding: "10px 20px" }}>
            Set Random Targets
          </button>
          <button onClick={() => setAllTargets(0.2)} style={{ padding: "10px 20px" }}>
            All → 20%
          </button>
          <button onClick={() => setAllTargets(0.8)} style={{ padding: "10px 20px" }}>
            All → 80%
          </button>
          <button onClick={() => setAllTargets(1.0)} style={{ padding: "10px 20px" }}>
            All → 100%
          </button>
        </div>

        <div
          style={{ marginTop: "15px", padding: "10px", background: "#1a1a1a", borderRadius: "4px" }}
        >
          <p style={{ margin: "5px 0" }}>
            <strong>Instructions:</strong>
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            1. Click "All → 20%" then "All → 80%" - watch bars OVERSHOOT and BOUNCE
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            2. Try "Auto Update" with 2000ms interval - bars complete full bounce between updates
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            3. Try 500ms interval - bars get interrupted, no visible bounce
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            4. Switch between modes - "bouncy" should show overshoot, "stiff" should not
          </p>
        </div>
      </div>

      {/* Bars */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          height: "300px",
          background: "#0a0a0a",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <BouncyBar key={i} barId={`test-bar-${i}`} mode={mode} />
        ))}
      </div>

      <div
        style={{
          color: "white",
          marginTop: "20px",
          padding: "15px",
          background: "#2a2a2a",
          borderRadius: "8px",
        }}
      >
        <h3>What You Should See:</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <li>
            <strong>With "bouncy" mode + manual clicks:</strong> Bars overshoot target, bounce back,
            wobble, settle
          </li>
          <li>
            <strong>With "stiff" mode + manual clicks:</strong> Bars move quickly to target with
            minimal/no overshoot
          </li>
          <li>
            <strong>With 2000ms auto update:</strong> Bars complete full spring motion between
            updates (visible bounce)
          </li>
          <li>
            <strong>With 500ms auto update:</strong> Bars get interrupted mid-bounce (no visible
            spring physics)
          </li>
        </ul>
        <p style={{ marginTop: "15px", fontStyle: "italic", fontSize: "14px" }}>
          This proves: Your visualizer's 100ms audio refresh is TOO FAST for spring physics to be
          visible!
        </p>
      </div>
    </div>
  );
};

export const SpringTest: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="spring-test">
      <SpringTestInner />
    </AnimationEngineProvider>
  );
};
