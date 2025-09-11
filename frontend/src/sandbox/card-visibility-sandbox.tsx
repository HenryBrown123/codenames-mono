/**
 * Card Visibility Sandbox with Animation DevTools
 * Clean implementation with metadata-based context system
 */

import React, { memo, useCallback, useState } from "react";
import { AnimationDevTools } from "./animation-devtools";
import {
  Card,
  useCardVisibility,
  useCardVisibilityStore,
  CARD_ANIMATIONS,
} from "./card-visbility-sandbox.hooks";
import styles from "./card-visibility-sandbox.module.css";

// ============= GAME CARD COMPONENT - CLEAN & SIMPLE =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
}>(({ card, index, onClick }) => {
  const { displayState, animatedRef } = useCardVisibility(card, "hidden", { index });

  const teamColor =
    !card.selected && card.teamName && displayState === "visible-colored"
      ? styles[`color${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}`]
      : "";

  const handleClick = () => {
    if (!card.selected && displayState !== "hidden") {
      onClick(card.word);
    }
  };

  // Clean component - just semantic HTML with animations
  return (
    <div
      id={`${card.word}-container`}
      data-element="container"
      data-team={card.teamName}
      ref={animatedRef(CARD_ANIMATIONS.container || CARD_ANIMATIONS.baseCard)}
      className={`${styles.cardWrapper} ${card.selected ? styles.selected : ""} ${teamColor}`}
      onClick={handleClick}
      data-state={displayState}
    >
      <div
        id={`${card.word}-word`}
        data-element="word"
        ref={animatedRef(CARD_ANIMATIONS.word)}
        className={styles.cardWord}
      >
        {card.word}
      </div>

      {displayState === "visible-colored" && card.teamName && (
        <div
          id={`${card.word}-badge`}
          data-element="badge"
          ref={animatedRef(CARD_ANIMATIONS.badge)}
          className={styles.cardBadge}
        >
          {card.teamName}
        </div>
      )}

      <div className={styles.cardState}>{displayState}</div>

      {card.selected && card.teamName && (
        <div
          id={`${card.word}-cover`}
          data-element="cover"
          ref={animatedRef(CARD_ANIMATIONS.coverCard)}
          className={`${styles.coverCard} ${
            styles[`cover${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}`]
          }`}
        >
          <div className={styles.coverWord}>{card.word}</div>
          <div className={styles.coverTeam}>{card.teamName}</div>
        </div>
      )}
    </div>
  );
});

GameCard.displayName = "GameCard";

// ============= DEMO SCENES =============
const DealInScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const reset = useCardVisibilityStore((s) => s.actions.reset);

  const dealCards = useCallback(() => {
    reset();
    const words = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE", "HONEYDEW"];
    const teams: Array<"red" | "blue" | "neutral" | "assassin"> = [
      "red",
      "blue",
      "neutral",
      "assassin",
    ];

    const newCards = words.map((word, i) => ({
      word,
      selected: false,
      teamName: teams[i % teams.length],
    }));
    setCards(newCards);
  }, [reset]);

  const clearCards = useCallback(() => {
    reset();
    setCards([]);
  }, [reset]);

  return (
    <div className={styles.scene}>
      <h2 className={styles.sceneTitle}>Scene 1: Cards Deal In</h2>
      <div className={styles.controls}>
        <button className={styles.button} onClick={dealCards}>
          Deal Cards
        </button>
        <button className={styles.buttonDanger} onClick={clearCards}>
          Clear
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard key={card.word} card={card} index={i} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const [cards] = useState<Card[]>([
    { word: "OCEAN", teamName: "blue", selected: false },
    { word: "FIRE", teamName: "red", selected: false },
    { word: "MOUNTAIN", teamName: "neutral", selected: false },
    { word: "SHADOW", teamName: "assassin", selected: false },
    { word: "RIVER", teamName: "blue", selected: false },
    { word: "SUNSET", teamName: "red", selected: false },
    { word: "FOREST", teamName: "neutral", selected: false },
    { word: "STORM", teamName: "blue", selected: false },
  ]);

  const viewMode = useCardVisibilityStore((s) => s.viewMode);
  const toggleViewMode = useCardVisibilityStore((s) => s.actions.toggleViewMode);

  return (
    <div className={styles.scene}>
      <h2 className={styles.sceneTitle}>Scene 2: Spymaster View Toggle</h2>
      <div className={styles.stateInfo}>
        <strong>View Mode:</strong> {viewMode}
      </div>
      <div className={styles.controls}>
        <button
          className={viewMode === "spymaster" ? styles.buttonActive : styles.button}
          onClick={toggleViewMode}
        >
          Toggle Spymaster View
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard key={card.word} card={card} index={i} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { word: "OCEAN", selected: false },
    { word: "FIRE", selected: false },
    { word: "MOUNTAIN", selected: false },
    { word: "SHADOW", selected: false },
    { word: "RIVER", selected: false },
    { word: "SUNSET", selected: false },
  ]);

  const reset = useCardVisibilityStore((s) => s.actions.reset);

  const gameData = [
    { word: "OCEAN", teamName: "blue" as const },
    { word: "FIRE", teamName: "red" as const },
    { word: "MOUNTAIN", teamName: "neutral" as const },
    { word: "SHADOW", teamName: "assassin" as const },
    { word: "RIVER", teamName: "blue" as const },
    { word: "SUNSET", teamName: "red" as const },
  ];

  const handleCardClick = useCallback((word: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.word === word) {
          const gameCard = gameData.find((g) => g.word === word);
          return {
            ...card,
            selected: true,
            teamName: gameCard?.teamName,
          };
        }
        return card;
      }),
    );
  }, []);

  const resetCards = useCallback(() => {
    reset();
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        selected: false,
        teamName: undefined,
      })),
    );
  }, [reset]);

  return (
    <div className={styles.scene}>
      <h2 className={styles.sceneTitle}>Scene 3: Player Card Selection</h2>
      <div className={styles.controls}>
        <button className={styles.buttonDanger} onClick={resetCards}>
          Reset Selections
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard key={card.word} card={card} index={i} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN SANDBOX WITH DEVTOOLS WRAPPER =============
export default function CardVisibilitySandbox() {
  const [activeScene, setActiveScene] = useState(1);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.actions.setTimeScale);
  const reset = useCardVisibilityStore((s) => s.actions.reset);

  React.useEffect(() => {
    reset();
  }, [activeScene, reset]);

  return (
    // Simple wrapper - that's it!
    <AnimationDevTools enabled={true} position="bottom-right" defaultOpen={false} theme="dark">
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>Card Visibility Animation System</h1>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <strong>Animation Speed:</strong>
              <button
                className={timeScale === 0.5 ? styles.buttonActive : styles.button}
                onClick={() => setTimeScale(0.5)}
              >
                0.5x
              </button>
              <button
                className={timeScale === 1 ? styles.buttonActive : styles.button}
                onClick={() => setTimeScale(1)}
              >
                1x
              </button>
              <button
                className={timeScale === 2 ? styles.buttonActive : styles.button}
                onClick={() => setTimeScale(2)}
              >
                2x
              </button>
            </div>

            <div className={styles.controlGroup}>
              <strong>Scene:</strong>
              {[1, 2, 3].map((scene) => (
                <button
                  key={scene}
                  className={activeScene === scene ? styles.buttonActive : styles.button}
                  onClick={() => setActiveScene(scene)}
                >
                  Scene {scene}
                </button>
              ))}
            </div>
          </div>

          {activeScene === 1 && <DealInScene />}
          {activeScene === 2 && <SpymasterViewScene />}
          {activeScene === 3 && <PlayerSelectionScene />}
        </div>
      </div>
    </AnimationDevTools>
  );
}
