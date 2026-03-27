import React, { useEffect, useRef } from "react";
import { useGameDataRequired } from "../game-data/providers";
import { useDealAnimation } from "../game-board/deal-animation-context";
import { ActionButton } from "../shared/components";
import { DesktopScene } from "./desktop-scene";
import { WindowedScene } from "./windowed-scene";
import { MobileScene } from "./mobile-scene";
import { useDisplayType } from "./use-display-type";
import { assertNever } from "../../utils/assert-never";
import styles from "./game-scene.module.css";

/**
 * Top-level game scene.
 * Selects a scene based on DisplayType — see display-type.ts for breakpoints.
 *
 * Adding a new DisplayType:
 *   1. Add the type string to DisplayType union in display-type.ts
 *   2. Add breakpoint constants to DISPLAY_BREAKPOINTS
 *   3. Update getDisplayType() logic
 *   4. Create the new Scene component
 *   5. Add case here — TypeScript will error until you do
 */
export const GameScene: React.FC = () => {
  const { gameData, isPending, isError, error, refetch, isFetching } = useGameDataRequired();
  const displayType = useDisplayType();
  const { resetDeal } = useDealAnimation();

  // When displayType changes, the scene component swaps (unmount/remount).
  // Reset deal state so cards appear instantly — no re-deal animation.
  const prevDisplay = useRef(displayType);
  useEffect(() => {
    if (prevDisplay.current !== displayType) {
      prevDisplay.current = displayType;
      resetDeal();
    }
  }, [displayType, resetDeal]);

  if (isPending && !gameData) {
    return <div className={styles.loadingState} />;
  }

  if (isError) {
    return (
      <div className={styles.errorState}>
        <h2>Failed to load game</h2>
        <p>{error?.message || "Unknown error"}</p>
        <ActionButton onClick={refetch} text="Retry" enabled={true} />
      </div>
    );
  }

  switch (displayType) {
    case "desktop":
      return <DesktopScene isFetching={isFetching} />;
    case "windowed":
      return <WindowedScene isFetching={isFetching} />;
    case "mobile":
      return <MobileScene isFetching={isFetching} />;
    default:
      return assertNever(displayType);
  }
};

GameScene.displayName = "GameScene";
