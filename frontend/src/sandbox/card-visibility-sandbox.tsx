// card-visibility-sandbox.tsx

import React, { useState, useMemo } from "react";
import {
  useCardVisibilityStore,
  useCardVisibility,
  type Card,
} from "./card-visibility-sandbox.hooks";
import * as animations from "./card-visibility-sandbox.animations";
import styles from "./card-visibility-sandbox.module.css";

const SAMPLE_WORDS = [
  "ROBOT",
  "PIANO",
  "DRAGON",
  "CASTLE",
  "OCEAN",
  "FOREST",
  "WIZARD",
  "ROCKET",
  "CRYSTAL",
  "THUNDER",
  "PHOENIX",
  "GLACIER",
  "VOLCANO",
  "NEBULA",
  "QUANTUM",
  "COSMOS",
];

const TEAM_DISTRIBUTION = {
  red: 8,
  blue: 7,
  neutral: 0,
  assassin: 1,
};

function generateCards(): Card[] {
  const cards: Card[] = [];
  const teams: Array<"red" | "blue" | "neutral" | "assassin"> = [];

  Object.entries(TEAM_DISTRIBUTION).forEach(([team, count]) => {
    for (let i = 0; i < count; i++) {
      teams.push(team as any);
    }
  });

  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }

  SAMPLE_WORDS.forEach((word, index) => {
    cards.push({
      word,
      teamName: teams[index],
      selected: false,
    });
  });

  return cards;
}

interface GameCardProps {
  card: Card;
  index: number;
  onSelect?: (word: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ card, index, onSelect }) => {
  const { displayState, isPending, viewMode, select, createAnimationRef } = useCardVisibility(
    card,
    index,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (card.selected || isPending || isProcessing) return;

    setIsProcessing(true);

    try {
      if (onSelect) {
        onSelect(card.word);
      }
      await select();
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  const containerAnims =
    card.teamName === "assassin" ? animations.containerAssassin : animations.container;
  const badgeAnims = card.teamName === "assassin" ? animations.badgeAssassin : animations.badge;

  return (
    <div className={styles.cardWrapper}>
      <div
        ref={createAnimationRef("container", containerAnims)}
        onClick={handleClick}
        className={`
          ${styles.card}
          ${styles[displayState]}
          ${card.teamName ? styles[`team-${card.teamName}`] : ""}
          ${isPending ? styles.transitioning : ""}
          ${card.selected ? styles.selected : ""}
        `}
        data-state={displayState}
        data-team={card.teamName}
        data-pending={isPending}
        data-selected={card.selected}
      >
        <div
          ref={createAnimationRef("cardInner", animations.cardInner)}
          className={styles.cardInner}
        >
          <div className={styles.cardFront}>
            <span ref={createAnimationRef("word", animations.word)} className={styles.word}>
              {card.word}
            </span>

            {displayState === "visible-colored" && card.teamName && (
              <div
                ref={createAnimationRef("badge", badgeAnims)}
                className={`${styles.teamBadge} ${styles[`badge-${card.teamName}`]}`}
              >
                {card.teamName.toUpperCase()}
              </div>
            )}
          </div>

          <div
            className={`${styles.cardBack} ${card.teamName ? styles[`back-${card.teamName}`] : ""}`}
          >
            <span className={styles.backText}>
              {card.teamName === "assassin" ? "💀" : card.teamName?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SceneProps {
  cards: Card[];
}

const DealInScene: React.FC<SceneProps> = ({ cards }) => {
  const dealCards = useCardVisibilityStore((state) => state.dealCards);
  const resetCards = useCardVisibilityStore((state) => state.resetCards);
  const initializeCards = useCardVisibilityStore((state) => state.initializeCards);
  const [isDealing, setIsDealing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [dealCount, setDealCount] = useState(4);

  React.useEffect(() => {
    initializeCards(cards);
  }, []);

  const handleDeal = async () => {
    setIsDealing(true);
    const wordsToDeal = cards.slice(0, dealCount).map((c) => c.word);
    await dealCards(wordsToDeal);
    setIsDealing(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetCards();
    setIsResetting(false);

    setTimeout(() => {
      initializeCards(cards);
    }, 400);
  };

  return (
    <div className={styles.scene}>
      <h2>Deal In Animation</h2>
      <div className={styles.controls}>
        <label>
          Cards to deal:
          <input
            type="range"
            min="1"
            max={cards.length}
            value={dealCount}
            onChange={(e) => setDealCount(Number(e.target.value))}
            disabled={isDealing || isResetting}
          />
          <span>{dealCount}</span>
        </label>
        <button onClick={handleDeal} disabled={isDealing || isResetting}>
          {isDealing ? "Dealing..." : `Deal ${dealCount} Cards`}
        </button>
        <button onClick={handleReset} disabled={isDealing || isResetting}>
          {isResetting ? "Resetting..." : "Reset All"}
        </button>
      </div>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <GameCard key={card.word} card={card} index={index} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC<SceneProps> = ({ cards }) => {
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleSpymasterView = useCardVisibilityStore((state) => state.toggleSpymasterView);
  const initializeCards = useCardVisibilityStore((state) => state.initializeCards);
  const dealCards = useCardVisibilityStore((state) => state.dealCards);
  const resetCards = useCardVisibilityStore((state) => state.resetCards);
  const [isToggling, setIsToggling] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasDealt, setHasDealt] = useState(false);

  React.useEffect(() => {
    initializeCards(cards);
  }, []);

  const handleDealAll = async () => {
    setIsDealing(true);
    await dealCards(cards.map((c) => c.word));
    setHasDealt(true);
    setIsDealing(false);
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleSpymasterView();
    setIsToggling(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetCards();
    setHasDealt(false);
    setIsResetting(false);

    setTimeout(() => {
      initializeCards(cards);
    }, 400);
  };

  return (
    <div className={styles.scene}>
      <h2>Spymaster View Toggle</h2>
      <div className={styles.controls}>
        {!hasDealt ? (
          <button onClick={handleDealAll} disabled={isDealing}>
            {isDealing ? "Dealing..." : "Deal All Cards"}
          </button>
        ) : (
          <>
            <button
              onClick={handleToggle}
              disabled={isToggling || isResetting}
              className={viewMode === "spymaster" ? styles.spymasterActive : ""}
            >
              {isToggling
                ? "Toggling..."
                : `${viewMode === "spymaster" ? "Disable" : "Enable"} Spymaster View`}
            </button>
            <button onClick={handleReset} disabled={isResetting}>
              {isResetting ? "Resetting..." : "Reset"}
            </button>
            <span className={styles.modeIndicator}>
              Mode: <strong>{viewMode}</strong>
            </span>
          </>
        )}
      </div>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <GameCard key={card.word} card={card} index={index} />
        ))}
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC<SceneProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState(initialCards);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleSpymasterView = useCardVisibilityStore((state) => state.toggleSpymasterView);
  const initializeCards = useCardVisibilityStore((state) => state.initializeCards);
  const dealCards = useCardVisibilityStore((state) => state.dealCards);
  const resetCards = useCardVisibilityStore((state) => state.resetCards);
  const [isToggling, setIsToggling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasDealt, setHasDealt] = useState(false);

  React.useEffect(() => {
    const setup = async () => {
      initializeCards(cards);
      await dealCards(cards.map((c) => c.word));
      setHasDealt(true);
    };
    setup();
  }, []);

  const handleCardSelect = (word: string) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.word === word ? { ...card, selected: true } : card)),
    );
    setSelectedWords((prev) => new Set([...prev, word]));
  };

  const handleToggleSpymaster = async () => {
    setIsToggling(true);
    await toggleSpymasterView();
    setIsToggling(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetCards();
    setCards(initialCards);
    setSelectedWords(new Set());
    setIsResetting(false);

    setTimeout(async () => {
      initializeCards(initialCards);
      await dealCards(initialCards.map((c) => c.word));
    }, 400);
  };

  const scores = useMemo(() => {
    const selected = cards.filter((c) => selectedWords.has(c.word));
    return {
      red: selected.filter((c) => c.teamName === "red").length,
      blue: selected.filter((c) => c.teamName === "blue").length,
      neutral: selected.filter((c) => c.teamName === "neutral").length,
      assassin: selected.filter((c) => c.teamName === "assassin").length,
    };
  }, [cards, selectedWords]);

  if (!hasDealt) {
    return (
      <div className={styles.scene}>
        <h2>Player Selection Scene</h2>
        <div className={styles.controls}>
          <span>Loading cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scene}>
      <h2>Player Selection Scene</h2>
      <div className={styles.controls}>
        <button
          onClick={handleToggleSpymaster}
          disabled={isToggling || isResetting}
          className={viewMode === "spymaster" ? styles.spymasterActive : ""}
        >
          {isToggling ? "Toggling..." : `${viewMode === "spymaster" ? "Hide" : "Show"} Teams`}
        </button>
        <button onClick={handleReset} disabled={isResetting}>
          {isResetting ? "Resetting..." : "Reset Game"}
        </button>
        <div className={styles.scores}>
          <span className={styles.scoreRed}>Red: {scores.red}/8</span>
          <span className={styles.scoreBlue}>Blue: {scores.blue}/7</span>
          {scores.assassin > 0 && <span className={styles.scoreAssassin}>💀 ASSASSIN!</span>}
        </div>
      </div>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <GameCard key={card.word} card={card} index={index} onSelect={handleCardSelect} />
        ))}
      </div>
    </div>
  );
};

export const CardVisibilitySandbox: React.FC = () => {
  const [activeScene, setActiveScene] = useState<"deal" | "spymaster" | "selection">("deal");
  const resetCards = useCardVisibilityStore((state) => state.resetCards);
  const cards = useMemo(() => generateCards(), []);

  const handleSceneChange = async (scene: "deal" | "spymaster" | "selection") => {
    await resetCards();
    setActiveScene(scene);
  };

  return (
    <div className={styles.sandbox}>
      <header className={styles.header}>
        <h1>Card Visibility System</h1>
        <nav className={styles.nav}>
          <button
            onClick={() => handleSceneChange("deal")}
            className={activeScene === "deal" ? styles.active : ""}
          >
            Deal Animation
          </button>
          <button
            onClick={() => handleSceneChange("spymaster")}
            className={activeScene === "spymaster" ? styles.active : ""}
          >
            Spymaster View
          </button>
          <button
            onClick={() => handleSceneChange("selection")}
            className={activeScene === "selection" ? styles.active : ""}
          >
            Player Selection
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        {activeScene === "deal" && <DealInScene cards={cards} />}
        {activeScene === "spymaster" && <SpymasterViewScene cards={cards} />}
        {activeScene === "selection" && <PlayerSelectionScene cards={cards} />}
      </main>
    </div>
  );
};

export default CardVisibilitySandbox;
