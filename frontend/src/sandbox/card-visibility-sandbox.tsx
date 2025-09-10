import React, { memo, useCallback, useState, useEffect } from "react";
import styles from "./card-visibility-sandbox.module.css";
import {
  Card,
  CardDisplayState,
  CARD_ANIMATIONS,
  useCardVisibilityStore,
  useCardVisibility,
  AnimationTracker,
} from "./card-visbility-sandbox.hooks";

// ============= GAME CARD COMPONENT =============
const GameCard = memo<{
  card: Card;
  index: number;
  onClick: (word: string) => void;
  initialState?: CardDisplayState;
}>(({ card, index, onClick, initialState = "hidden" }) => {
  const { displayState, animatedRef } = useCardVisibility(card, initialState, { index });
  const viewMode = useCardVisibilityStore((state) => state.viewMode);

  const handleClick = () => {
    if (!card.selected && displayState !== "hidden") {
      onClick(card.word);
    }
  };

  // Build the animation key directly from teamName
  const baseCardAnimationKey = card.teamName ? `baseCard-${card.teamName}` : "baseCard";

  return (
    <div
      ref={animatedRef({
        id: baseCardAnimationKey,
        animations: CARD_ANIMATIONS[baseCardAnimationKey] || CARD_ANIMATIONS.baseCard,
      })}
      className={`${styles.cardWrapper} ${card.selected ? styles.selected : ""}`}
      onClick={handleClick}
      data-state={displayState}
    >
      <div
        ref={animatedRef({ id: "word", animations: CARD_ANIMATIONS.word })}
        className={styles.cardWord}
      >
        {card.word}
      </div>

      {viewMode === "spymaster" && card.teamName && (
        <div
          ref={animatedRef({ id: "badge", animations: CARD_ANIMATIONS.badge })}
          className={styles.cardBadge}
        >
          {card.teamName}
        </div>
      )}

      {card.selected && card.teamName && (
        <div
          ref={animatedRef({ id: "coverCard", animations: CARD_ANIMATIONS.coverCard })}
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

// ============= SWIMLANES VISUALIZER =============
const SwimlanesVisualizer: React.FC = () => {
  const animationTrackers = useCardVisibilityStore((s) => s.animationTrackers);

  // Use status for categorization, progress is already in tracker
  const categorizedTrackers = animationTrackers.reduce(
    (acc, tracker) => {
      if (tracker.status === "pending") {
        acc.pending.push(tracker);
      } else if (tracker.status === "running") {
        acc.running.push(tracker);
      } else if (tracker.status === "finished") {
        acc.finished.push(tracker);
      }

      return acc;
    },
    {
      pending: [] as AnimationTracker[],
      running: [] as AnimationTracker[],
      finished: [] as AnimationTracker[],
    },
  );

  return (
    <div className={styles.swimlanes}>
      <h2 className={styles.swimlanesTitle}>Animation Timeline</h2>
      <div className={styles.swimlanesContainer}>
        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.pending}`}>
            Pending ({categorizedTrackers.pending.length})
          </div>
          <div className={styles.swimlaneContent}>
            {categorizedTrackers.pending.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={styles.swimlaneItem}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div className={styles.swimlaneItemEvent}>{tracker.trigger}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.running}`}>
            Running ({categorizedTrackers.running.length})
          </div>
          <div className={styles.swimlaneContent}>
            {categorizedTrackers.running.map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={styles.swimlaneItem}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div className={styles.swimlaneItemEvent}>{tracker.trigger}</div>
                <div className={styles.swimlaneProgress}>
                  <div
                    className={styles.swimlaneProgressBar}
                    style={{ width: `${(tracker.progress || 0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.swimlane}>
          <div className={`${styles.swimlaneHeader} ${styles.finished}`}>
            Finished ({categorizedTrackers.finished.length})
          </div>
          <div className={styles.swimlaneContent}>
            {categorizedTrackers.finished.slice(-10).map((tracker, i) => (
              <div
                key={`${tracker.cardId}-${tracker.elementName}-${i}`}
                className={styles.swimlaneItem}
              >
                <div className={styles.swimlaneItemTitle}>{tracker.cardId}</div>
                <div className={styles.swimlaneItemElement}>{tracker.elementName}</div>
                <div className={styles.swimlaneItemEvent}>{tracker.trigger}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= DEMO SCENES =============
const DealInScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const reset = useCardVisibilityStore((s) => s.actions.reset);

  const dealCards = useCallback(() => {
    reset();
    const words = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE", "HONEYDEW"];
    const newCards = words.map((word) => ({
      word,
      selected: false,
    }));
    setCards(newCards);
  }, [reset]);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 1: Cards Deal In</h2>
      <div className={styles.controls}>
        <button className={styles.button} onClick={dealCards}>
          Deal Cards
        </button>
        <button className={styles.buttonDanger} onClick={() => setCards([])}>
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
    <div>
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

const PlayerSelectionScene: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { word: "OCEAN", selected: false },
    { word: "FIRE", selected: false },
    { word: "MOUNTAIN", selected: false },
    { word: "SHADOW", selected: false },
    { word: "RIVER", selected: false },
    { word: "SUNSET", selected: false },
  ]);

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
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        selected: false,
        teamName: undefined,
      })),
    );
  }, []);

  return (
    <div>
      <h2 className={styles.sceneTitle}>Scene 3: Player Card Selection</h2>
      <div className={styles.controls}>
        <button className={styles.buttonDanger} onClick={resetCards}>
          Reset Selections
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <GameCard
            key={card.word}
            card={card}
            index={i}
            onClick={handleCardClick}
            initialState="visible"
          />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN SANDBOX =============
export default function CardVisibilitySandbox() {
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
        <h1 className={styles.title}>Card Visibility Animation System</h1>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <strong>Animation Speed:</strong>
            <button className={styles.button} onClick={() => setTimeScale(0.5)}>
              0.5x
            </button>
            <button
              className={timeScale === 1 ? styles.buttonActive : styles.button}
              onClick={() => setTimeScale(1)}
            >
              1x
            </button>
            <button className={styles.button} onClick={() => setTimeScale(2)}>
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

        <SwimlanesVisualizer />
      </div>
    </div>
  );
}
