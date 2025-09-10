// card-visibility-sandbox.tsx
import React, { memo, useCallback, useState } from "react";
import styles from "./card-visibility-sandbox.module.css";
import {
  Card,
  CardDisplayState,
  ViewMode,
  CARD_ANIMATIONS,
  useCardVisibilityStore,
  useCardVisibility,
  AnimatedElementConfig,
} from "./card-visbility-sandbox.hooks";

// ============= GAME CARD COMPONENT =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  initialState?: CardDisplayState;
}>(({ card, index, onClick, initialState = "hidden" }) => {
  const { displayState, animatedRef } = useCardVisibility(card, initialState, { index });

  const teamColor =
    !card.selected && card.teamName && displayState === "visible-colored"
      ? styles[`color${card.teamName.charAt(0).toUpperCase()}${card.teamName.slice(1)}`]
      : "";

  const handleClick = () => {
    if (!card.selected && displayState !== "hidden") {
      onClick(card.word);
    }
  };

  return (
    <div
      ref={animatedRef({
        id: "container",
        animations: CARD_ANIMATIONS.container,
      })}
      className={`${styles.cardWrapper} ${teamColor}`}
      onClick={handleClick}
      data-state={displayState}
    >
      <div
        ref={animatedRef({
          id: "word",
          animations: CARD_ANIMATIONS.word,
        })}
        className={styles.cardWord}
      >
        {card.word}
      </div>

      {displayState === "visible-colored" && card.teamName && (
        <div
          ref={animatedRef({
            id: "badge",
            animations: CARD_ANIMATIONS.badge,
          })}
          className={styles.cardBadge}
        >
          {card.teamName}
        </div>
      )}

      {card.selected && card.teamName && (
        <div
          ref={animatedRef({
            id: "cover",
            animations: CARD_ANIMATIONS.coverCard,
          })}
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
const DealingScene: React.FC = () => {
  const [cards] = useState<Card[]>([
    { word: "APPLE", teamName: "red", selected: false },
    { word: "BANANA", teamName: "blue", selected: false },
    { word: "CHERRY", teamName: "red", selected: false },
    { word: "DATE", teamName: "neutral", selected: false },
    { word: "ELDERBERRY", teamName: "blue", selected: false },
    { word: "FIG", teamName: "assassin", selected: false },
    { word: "GRAPE", teamName: "red", selected: false },
    { word: "HONEYDEW", teamName: "blue", selected: false },
  ]);

  return (
    <div className={styles.sceneContainer}>
      <h2 className={styles.sceneTitle}>Scene 1: Dealing Cards</h2>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={() => {}}
            initialState="hidden"
          />
        ))}
      </div>
    </div>
  );
};

const SelectionScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { word: "PIANO", teamName: "red", selected: false },
    { word: "GUITAR", teamName: "blue", selected: false },
    { word: "DRUMS", teamName: "red", selected: true },
    { word: "VIOLIN", teamName: "neutral", selected: false },
    { word: "TRUMPET", teamName: "blue", selected: false },
    { word: "FLUTE", teamName: "assassin", selected: false },
    { word: "SAXOPHONE", teamName: "red", selected: false },
    { word: "CELLO", teamName: "blue", selected: true },
  ]);

  const handleClick = (word: string) => {
    setCards((prev) =>
      prev.map((card) => (card.word === word ? { ...card, selected: true } : card)),
    );
  };

  return (
    <div className={styles.sceneContainer}>
      <h2 className={styles.sceneTitle}>Scene 2: Card Selection</h2>
      <p className={styles.sceneDescription}>Click cards to select them</p>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={handleClick}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

const ViewModeScene: React.FC = () => {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleViewMode = useCardVisibilityStore((state) => state.actions.toggleViewMode);

  const [cards] = useState<Card[]>([
    { word: "LONDON", teamName: "red", selected: false },
    { word: "PARIS", teamName: "blue", selected: false },
    { word: "TOKYO", teamName: "red", selected: false },
    { word: "BERLIN", teamName: "neutral", selected: false },
    { word: "MOSCOW", teamName: "blue", selected: false },
    { word: "ROME", teamName: "assassin", selected: false },
    { word: "MADRID", teamName: "red", selected: false },
    { word: "BEIJING", teamName: "blue", selected: false },
  ]);

  return (
    <div className={styles.sceneContainer}>
      <h2 className={styles.sceneTitle}>Scene 3: Spymaster View Toggle</h2>
      <div className={styles.controls}>
        <button className={styles.button} onClick={toggleViewMode}>
          Switch to {viewMode === "normal" ? "Spymaster" : "Field Operative"} View
        </button>
        <div
          className={`${styles.viewIndicator} ${
            viewMode === "spymaster" ? styles.spymaster : styles.player
          }`}
        >
          {viewMode.toUpperCase()} VIEW
        </div>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={() => {}}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

const CompleteFlowScene: React.FC = () => {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleViewMode = useCardVisibilityStore((state) => state.actions.toggleViewMode);
  const reset = useCardVisibilityStore((state) => state.actions.reset);

  const [cards, setCards] = useState<Card[]>([
    { word: "CAT", teamName: "red", selected: false },
    { word: "DOG", teamName: "blue", selected: false },
    { word: "BIRD", teamName: "red", selected: false },
    { word: "FISH", teamName: "neutral", selected: false },
    { word: "RABBIT", teamName: "blue", selected: false },
    { word: "SNAKE", teamName: "assassin", selected: false },
    { word: "HORSE", teamName: "red", selected: false },
    { word: "TURTLE", teamName: "blue", selected: false },
  ]);

  const [dealtCards, setDealtCards] = useState(false);

  const handleDeal = () => {
    reset();
    setDealtCards(true);
  };

  const handleClick = (word: string) => {
    if (viewMode === "normal") {
      setCards((prev) =>
        prev.map((card) => (card.word === word ? { ...card, selected: true } : card)),
      );
    }
  };

  const handleReset = () => {
    setCards((prev) => prev.map((card) => ({ ...card, selected: false })));
    setDealtCards(false);
    reset();
  };

  return (
    <div className={styles.sceneContainer}>
      <h2 className={styles.sceneTitle}>Scene 4: Complete Flow</h2>
      <div className={styles.controls}>
        {!dealtCards ? (
          <button className={styles.button} onClick={handleDeal}>
            Deal Cards
          </button>
        ) : (
          <>
            <button className={styles.button} onClick={toggleViewMode}>
              Toggle View ({viewMode})
            </button>
            <button className={styles.buttonDanger} onClick={handleReset}>
              Reset All
            </button>
          </>
        )}
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={handleClick}
            initialState={dealtCards ? "hidden" : "hidden"}
          />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN SANDBOX =============
export const CardVisibilitySandbox: React.FC = () => {
  const [activeScene, setActiveScene] = useState(1);
  const timeScale = useCardVisibilityStore((s) => s.timeScale);
  const setTimeScale = useCardVisibilityStore((s) => s.actions.setTimeScale);
  const reset = useCardVisibilityStore((s) => s.actions.reset);

  React.useEffect(() => {
    reset();
  }, [activeScene, reset]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Card Visibility Animation System - Refactored</h1>

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
            {[1, 2, 3, 4].map((scene) => (
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

        <div className={styles.sceneWrapper}>
          {activeScene === 1 && <DealingScene />}
          {activeScene === 2 && <SelectionScene />}
          {activeScene === 3 && <ViewModeScene />}
          {activeScene === 4 && <CompleteFlowScene />}
        </div>
      </div>
    </div>
  );
};
