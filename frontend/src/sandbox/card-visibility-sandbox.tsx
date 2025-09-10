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
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  // Group by card, then get the latest event for each card
  const eventsByCard = animationTrackers.reduce((acc, tracker) => {
    if (!acc[tracker.cardId]) {
      acc[tracker.cardId] = {
        trigger: tracker.trigger,
        startTime: tracker.startTime,
        endTime: tracker.startTime + tracker.duration,
        elements: []
      };
    }
    
    const event = acc[tracker.cardId];
    // If this is a different trigger, replace the whole event (new animation started)
    if (event.trigger !== tracker.trigger) {
      acc[tracker.cardId] = {
        trigger: tracker.trigger,
        startTime: tracker.startTime,
        endTime: tracker.startTime + tracker.duration,
        elements: [tracker]
      };
    } else {
      // Same trigger, add to elements
      event.elements.push(tracker);
      event.startTime = Math.min(event.startTime, tracker.startTime);
      event.endTime = Math.max(event.endTime, tracker.startTime + tracker.duration);
    }
    
    return acc;
  }, {} as Record<string, {
    trigger: string;
    startTime: number;
    endTime: number;
    elements: AnimationTracker[];
  }>);

  // Determine event status based on ALL elements
  const getEventStatus = (event: typeof eventsByCard[string]) => {
    const allFinished = event.elements.every(el => el.status === 'finished');
    const anyRunning = event.elements.some(el => el.status === 'running');
    const allPending = event.elements.every(el => el.status === 'pending');
    
    if (allFinished) return 'finished';
    if (allPending) return 'pending';
    if (anyRunning) return 'running';
    return 'running'; // Some finished, some pending
  };

  // Group cards by their event status
  const cardsByStatus = Object.entries(eventsByCard).reduce((acc, [cardId, event]) => {
    const status = getEventStatus(event);
    if (!acc[status]) acc[status] = [];
    acc[status].push({ cardId, event });
    return acc;
  }, {} as Record<string, Array<{ cardId: string; event: typeof eventsByCard[string] }>>);

  const renderEventBlock = (cardId: string, event: typeof eventsByCard[string]) => {
    const eventStatus = getEventStatus(event);
    
    return (
      <div key={cardId} className={styles.eventBlock} data-status={eventStatus}>
        <div className={styles.eventHeader}>
          <span className={styles.eventCard}>{cardId}</span>
          <span className={styles.eventTrigger}>{event.trigger}</span>
        </div>
        <div className={styles.eventElements}>
          {event.elements.map((el, i) => {
            const progress = el.status === 'running' 
              ? Math.min((currentTime - el.startTime) / el.duration, 1)
              : el.status === 'finished' ? 1 : 0;
            
            return (
              <div
                key={`${el.elementName}-${i}`}
                className={styles.eventElement}
                data-status={el.status}
              >
                <span className={styles.elementName}>{el.elementName}</span>
                <div className={styles.elementProgress}>
                  <div 
                    className={styles.elementProgressBar}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.timeline}>
      <h2 className={styles.timelineTitle}>Animation Timeline</h2>
      <div className={styles.timelineColumns}>
        {/* Pending column */}
        <div className={styles.timelineColumn}>
          <div className={styles.columnHeader} data-status="pending">
            Pending ({cardsByStatus.pending?.length || 0})
          </div>
          <div className={styles.columnContent}>
            {cardsByStatus.pending?.map(({ cardId, event }) => 
              renderEventBlock(cardId, event)
            )}
          </div>
        </div>

        {/* Running column */}
        <div className={styles.timelineColumn}>
          <div className={styles.columnHeader} data-status="running">
            Running ({cardsByStatus.running?.length || 0})
          </div>
          <div className={styles.columnContent}>
            {cardsByStatus.running?.map(({ cardId, event }) => 
              renderEventBlock(cardId, event)
            )}
          </div>
        </div>

        {/* Finished column */}
        <div className={styles.timelineColumn}>
          <div className={styles.columnHeader} data-status="finished">
            Finished ({cardsByStatus.finished?.length || 0})
          </div>
          <div className={styles.columnContent}>
            {cardsByStatus.finished?.slice(-10).map(({ cardId, event }) => 
              renderEventBlock(cardId, event)
            )}
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

  const reset = useCardVisibilityStore((s) => s.actions.reset); // Add this

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
