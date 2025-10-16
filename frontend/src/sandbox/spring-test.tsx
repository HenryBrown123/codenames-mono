import React, { useEffect, useState } from "react";
import { AnimationEngineProvider, useAnimationEngine } from "../gameplay/animations/animation-engine-context";
import { useAnimationRegistration } from "../gameplay/animations/use-animation-registration";
import { SPRING_CONFIGS } from "../gameplay/animations/spring-animation";
import type { SpringAnimationDefinition } from "../gameplay/animations/animation-types";
import styles from "./spring-test.module.css";

const SPRING_CONFIG_LABELS: Record<keyof typeof SPRING_CONFIGS, string> = {
  extreme: "Extreme",
  bouncy: "Bouncy",
  smooth: "Smooth",
  stiff: "Stiff",
};

// Configuration constants
const BAR_COUNT = 8;
const SPRING_DURATION_MS = 1000;
const DEFAULT_UPDATE_INTERVAL_MS = 2000;
const MIN_UPDATE_INTERVAL_MS = 500;
const MAX_UPDATE_INTERVAL_MS = 5000;
const UPDATE_INTERVAL_STEP_MS = 500;

// Scale constants
const MIN_SCALE_Y = 0.2;
const MID_SCALE_Y = 0.8;
const MAX_SCALE_Y = 1.0;

const BouncyBar: React.FC<{ barId: string; mode: keyof typeof SPRING_CONFIGS }> = ({
  barId,
  mode,
}) => {
  const { createAnimationRef } = useAnimationRegistration(barId);

  const animations: Record<string, SpringAnimationDefinition> = {
    bounce: {
      keyframes: [{ transform: `scaleY(${MIN_SCALE_Y})` }, { transform: `scaleY(${MAX_SCALE_Y})` }],
      springConfig: SPRING_CONFIGS[mode],
      options: { duration: SPRING_DURATION_MS },
      trackContext: (context) => (context.target as number) ?? MIN_SCALE_Y,
    },
  };

  return (
    <div className={styles.barContainer}>
      <div ref={createAnimationRef("bar", animations)} className={styles.bar} />
    </div>
  );
};

const SpringTestInner: React.FC = () => {
  const engine = useAnimationEngine();
  const [mode, setMode] = useState<keyof typeof SPRING_CONFIGS>("bouncy");
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(DEFAULT_UPDATE_INTERVAL_MS);

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
    <div className={styles.container}>
      <h1 className={styles.title}>Spring Physics Test</h1>

      {/* Controls */}
      <div className={styles.controlPanel}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Spring Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as keyof typeof SPRING_CONFIGS)}
            className={styles.select}
          >
            {(Object.keys(SPRING_CONFIGS) as Array<keyof typeof SPRING_CONFIGS>).map((key) => (
              <option key={key} value={key}>
                {SPRING_CONFIG_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.rangeLabel}>
            Auto Update Interval: {updateInterval}ms
          </label>
          <input
            type="range"
            min={MIN_UPDATE_INTERVAL_MS}
            max={MAX_UPDATE_INTERVAL_MS}
            step={UPDATE_INTERVAL_STEP_MS}
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={() => setAutoUpdate(!autoUpdate)} className={styles.button}>
            {autoUpdate ? "Stop Auto Update" : "Start Auto Update"}
          </button>
          <button onClick={setRandomTargets} className={styles.button}>
            Set Random Targets
          </button>
          <button onClick={() => setAllTargets(MIN_SCALE_Y)} className={styles.button}>
            All → 20%
          </button>
          <button onClick={() => setAllTargets(MID_SCALE_Y)} className={styles.button}>
            All → 80%
          </button>
          <button onClick={() => setAllTargets(MAX_SCALE_Y)} className={styles.button}>
            All → 100%
          </button>
        </div>

        <div className={styles.instructionsPanel}>
          <p className={styles.instructionsTitle}>
            <strong>Instructions:</strong>
          </p>
          <p className={styles.instructionItem}>
            1. Click "All → 20%" then "All → 80%" - watch bars OVERSHOOT and BOUNCE
          </p>
          <p className={styles.instructionItem}>
            2. Try "Auto Update" with 2000ms interval - bars complete full bounce between updates
          </p>
          <p className={styles.instructionItem}>
            3. Try 500ms interval - bars get interrupted, no visible bounce
          </p>
          <p className={styles.instructionItem}>
            4. Switch between modes - "bouncy" should show overshoot, "stiff" should not
          </p>
        </div>
      </div>

      {/* Bars */}
      <div className={styles.visualizerContainer}>
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <BouncyBar key={i} barId={`test-bar-${i}`} mode={mode} />
        ))}
      </div>

      <div className={styles.infoPanel}>
        <h3 className={styles.infoTitle}>What You Should See:</h3>
        <ul className={styles.infoList}>
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
        <p className={styles.note}>
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
