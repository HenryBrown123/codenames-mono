import React, { useState } from "react";
import { AnimationEngineProvider } from '../gameplay/animations';
import { DevToolsPanel } from '../gameplay/animations/animation-devtools';
import {
  useSandboxStore,
  useSandboxCoordinator,
  useSandboxCardVisibility,
} from "./card-visibility-sandbox.hooks";
import styles from "./card-visibility-sandbox.module.css";

interface SandboxCardProps {
  word: string;
  index: number;
}

const SandboxCard: React.FC<SandboxCardProps> = ({ word, index }) => {
  const { card, displayState, createAnimationRef } = useSandboxCardVisibility(word, index);
  const viewMode = useSandboxStore(state => state.viewMode);

  const cardAnimations = {
    'deal': {
      keyframes: [
        {
          transform: 'translateY(-100vh) rotate(-15deg)',
          opacity: 0
        },
        {
          transform: 'translateY(0) rotate(0deg)',
          opacity: 1
        }
      ],
      options: {
        duration: 800,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'both' as FillMode,
      }
    },
    'select': {
      keyframes: [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(90deg)', offset: 0.5 },
        { transform: 'rotateY(180deg)' }
      ],
      options: {
        duration: 600,
        easing: 'ease-in-out',
        fill: 'both' as FillMode,
      }
    },
    'reset': {
      keyframes: [
        { opacity: 1 },
        { opacity: 0 }
      ],
      options: {
        duration: 300,
        easing: 'ease-out',
        fill: 'both' as FillMode,
      }
    },
  };

  const overlayAnimations = {
    'reveal-colors': {
      keyframes: [
        { opacity: '0', transform: 'scale(0.8) translateY(-10px)' },
        { opacity: '1', transform: 'scale(1) translateY(0)' }
      ],
      options: {
        duration: 400,
        delay: 100,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards' as FillMode,
      }
    },
    'hide-colors': {
      keyframes: [
        { opacity: '1', transform: 'scale(1)' },
        { opacity: '0', transform: 'scale(0.8)' }
      ],
      options: {
        duration: 200,
        fill: 'forwards' as FillMode,
      }
    }
  };

  if (!card) {
    return (
      <div style={{
        width: '200px',
        height: '133px',
        border: '2px dashed #444',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        background: '#1a1a1a',
      }}>
        <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>No card</div>
      </div>
    );
  }

  const teamColor = card.teamName === 'red' ? '#dc2626' :
                   card.teamName === 'blue' ? '#2563eb' :
                   card.teamName === 'assassin' ? '#000' : '#9ca3af';

  return (
    <div
      ref={createAnimationRef('container', cardAnimations)}
      className={styles.card}
      style={{
        perspective: '1000px',
        width: '200px',
        height: '133px',
        opacity: displayState === 'hidden' ? 0 : 1,
        transform: displayState === 'hidden' ? 'translateY(-100vh)' : 'translateY(0)',
      }}
    >
      <div
        className={styles.cardInner}
        style={{
          transform: card.selected ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          <span>{card.word}</span>
        </div>

        <div className={`${styles.cardFace} ${styles.cardBack} ${styles[card.teamName]}`}>
          <div style={{
            width: '60%',
            height: '60%',
            borderRadius: '8px',
            background: teamColor,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }} />
        </div>
      </div>

      {/* Spymaster overlay - separate animated element */}
      {viewMode === 'spymaster' && displayState !== 'hidden' && displayState !== 'covered' && (
        <div
          ref={createAnimationRef('overlay', overlayAnimations)}
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '4px',
            backgroundColor: teamColor,
            opacity: displayState === 'visible-colored' ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

const DealInScene: React.FC = () => {
  const initializeCards = useSandboxStore(state => state.initializeCards);
  const dealCard = useSandboxStore(state => state.dealCard);
  const resetAll = useSandboxStore(state => state.resetAll);
  const cards = useSandboxStore(state => state.cards);

  useSandboxCoordinator();

  const [isDealing, setIsDealing] = useState(false);

  const mockCards = React.useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      word: `CARD-${i + 1}`,
      teamName: 'neutral'
    })),
    []
  );

  React.useEffect(() => {
    initializeCards(mockCards);
  }, [initializeCards, mockCards]);

  const handleDeal = async () => {
    setIsDealing(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Queue deal transition for each card
    mockCards.forEach(card => dealCard(card.word));

    setIsDealing(false);
  };

  const handleReset = () => {
    resetAll();
    setTimeout(() => initializeCards(mockCards), 100);
  };

  return (
    <div className={styles.scene}>
      <h2>Deal Animation - 4x4 Grid</h2>
      <p className={styles.description}>
        Cards fly in from top with stagger based on position
      </p>

      <div className={styles.controls}>
        <button onClick={handleDeal} disabled={isDealing || cards.size > 0 && Array.from(cards.values()).some(c => c.displayState !== 'hidden')}>
          {isDealing ? '⏳ Dealing...' : '🎴 Deal Cards'}
        </button>
        <button onClick={handleReset}>🔄 Reset</button>
      </div>

      <div className={styles.grid} style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {mockCards.map((card, index) => (
          <SandboxCard key={card.word} word={card.word} index={index} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const initializeCards = useSandboxStore(state => state.initializeCards);
  const dealCard = useSandboxStore(state => state.dealCard);
  const toggleViewMode = useSandboxStore(state => state.toggleViewMode);
  const resetAll = useSandboxStore(state => state.resetAll);
  const viewMode = useSandboxStore(state => state.viewMode);

  useSandboxCoordinator();

  const mockCards = React.useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      word: `SPY-${i + 1}`,
      teamName: (['red', 'blue', 'neutral', 'assassin'] as const)[i % 4]
    })),
    []
  );

  React.useEffect(() => {
    initializeCards(mockCards);
    // Auto-deal cards on mount
    setTimeout(() => {
      mockCards.forEach(card => dealCard(card.word));
    }, 100);
  }, [initializeCards, dealCard, mockCards]);

  const handleToggle = () => {
    toggleViewMode();
  };

  const handleReset = () => {
    resetAll();
    setTimeout(() => {
      initializeCards(mockCards);
      setTimeout(() => mockCards.forEach(card => dealCard(card.word)), 100);
    }, 100);
  };

  return (
    <div className={styles.scene}>
      <h2>Spymaster View Toggle</h2>
      <p className={styles.description}>
        Toggle to reveal/hide team colors with animation
      </p>

      <div className={styles.controls}>
        <button onClick={handleToggle}>
          {viewMode === 'spymaster' ? '🕶️ Hide Colors' : '👁️ Reveal Colors'}
        </button>
        <button onClick={handleReset}>🔄 Reset</button>
      </div>

      <div className={styles.grid} style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {mockCards.map((card, index) => (
          <SandboxCard key={card.word} word={card.word} index={index} />
        ))}
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC = () => {
  const cards = useSandboxStore(state => state.cards);
  const initializeCard = useSandboxStore(state => state.initializeCard);
  const dealCard = useSandboxStore(state => state.dealCard);
  const selectCard = useSandboxStore(state => state.selectCard);
  const resetCard = useSandboxStore(state => state.resetCard);

  useSandboxCoordinator();

  const cardWord = 'SELECT';
  const card = cards.get(cardWord);

  const handleDeal = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    initializeCard(cardWord, 'neutral');
    dealCard(cardWord);
  };

  const handleSelect = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    selectCard(cardWord);
  };

  const handleReset = async () => {
    resetCard(cardWord);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className={styles.scene}>
      <h2>Player Selection</h2>
      <p className={styles.description}>
        Card flips to reveal team color when selected
      </p>

      <div className={styles.controls}>
        <button onClick={handleDeal} disabled={!!card}>Deal Card</button>
        <button onClick={handleSelect} disabled={!card || card.selected}>Select Card</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: '1fr', maxWidth: '200px', margin: '0 auto' }}>
        <SandboxCard word={cardWord} index={0} />
      </div>
    </div>
  );
};

const TimingTestScene: React.FC = () => {
  const cards = useSandboxStore(state => state.cards);
  const pendingTransitions = useSandboxStore(state => state.pendingTransitions);
  const initializeCards = useSandboxStore(state => state.initializeCards);
  const dealCard = useSandboxStore(state => state.dealCard);
  const selectCard = useSandboxStore(state => state.selectCard);
  const resetAll = useSandboxStore(state => state.resetAll);

  const [isDealing, setIsDealing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useSandboxCoordinator();

  const cardWord = 'TIMING-1';
  const card = cards.get(cardWord);

  const handleDeal = async () => {
    console.log('[🔵 TimingTest] Deal clicked');
    setIsDealing(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[🟢 TimingTest] Initializing and dealing');
    initializeCards([{ word: cardWord, teamName: 'blue' }]);
    dealCard(cardWord);

    setIsDealing(false);
  };

  const handleSelect = async () => {
    if (!card) return;

    console.log('[🔵 TimingTest] Select clicked');
    setIsSelecting(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('[🟢 TimingTest] Queuing select transition');
    selectCard(cardWord);

    setIsSelecting(false);
  };

  const handleReset = async () => {
    console.log('[🔄 TimingTest] Reset clicked');
    setIsResetting(true);

    resetAll();

    await new Promise(resolve => setTimeout(resolve, 500));

    setIsResetting(false);
  };

  return (
    <div className={styles.scene}>
      <h2>🧪 Timing Test - Single Card</h2>
      <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Tests async flow: Button → State → React render → Effect → Animation → Commit
      </p>

      <div className={styles.controls}>
        <button
          onClick={handleDeal}
          disabled={isDealing || isSelecting || isResetting || !!card}
        >
          {isDealing ? '⏳ Dealing...' : '🎴 Deal Card'}
        </button>

        <button
          onClick={handleSelect}
          disabled={!card || isSelecting || isDealing || isResetting || card.selected}
        >
          {isSelecting ? '⏳ Selecting...' : '👆 Select Card'}
        </button>

        <button
          onClick={handleReset}
          disabled={!card || isDealing || isSelecting || isResetting}
        >
          {isResetting ? '⏳ Resetting...' : '🔄 Reset'}
        </button>
      </div>

      <div style={{
        color: '#666',
        fontSize: '0.85rem',
        marginBottom: '1rem',
        padding: '0.5rem',
        background: '#1a1a1a',
        borderRadius: '4px',
      }}>
        <div>Card state: {card ? `"${card.word}" (${card.selected ? '✅ selected' : '⭕ not selected'})` : '❌ none'}</div>
        <div>Display state: {card?.displayState || 'N/A'}</div>
        <div>Transitioning: {card?.isTransitioning ? '✅' : '❌'}</div>
        <div>Pending transitions: {pendingTransitions.size}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', minHeight: '200px' }}>
        <SandboxCard word={cardWord} index={0} />
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '4px', fontSize: '0.85rem' }}>
        <strong style={{ color: '#fff' }}>Expected flow:</strong>
        <ol style={{ color: '#999', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Click button → state updated with pending transition</li>
          <li>React re-renders → GameCard mounts/updates</li>
          <li>GameCard registers elements via ref callbacks</li>
          <li>useLayoutEffect sees pending transitions</li>
          <li>Effect calls engine.playTransitions()</li>
          <li>Animations execute (all elements registered!)</li>
          <li>Promise resolves → commitTransitions() updates display state</li>
          <li>Success! No timing issues, no flags, clean state machine</li>
        </ol>
      </div>
    </div>
  );
};

const SandboxContent: React.FC = () => {
  const [activeScene, setActiveScene] = useState<"deal" | "spymaster" | "selection" | "timing">("timing");
  const resetAll = useSandboxStore(state => state.resetAll);

  const handleSceneChange = async (scene: "deal" | "spymaster" | "selection" | "timing") => {
    resetAll();
    await new Promise(resolve => setTimeout(resolve, 100));
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
          <button
            onClick={() => handleSceneChange("timing")}
            className={activeScene === "timing" ? styles.active : ""}
          >
            🧪 Timing Test
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        {activeScene === "deal" && <DealInScene />}
        {activeScene === "spymaster" && <SpymasterViewScene />}
        {activeScene === "selection" && <PlayerSelectionScene />}
        {activeScene === "timing" && <TimingTestScene />}
      </main>
    </div>
  );
};

export const CardVisibilitySandbox: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="sandbox">
      <SandboxContent />
      <DevToolsPanel defaultOpen={true} theme="dark" />
    </AnimationEngineProvider>
  );
};

export default CardVisibilitySandbox;
