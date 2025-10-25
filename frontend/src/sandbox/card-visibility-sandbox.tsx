import React, { useState, useMemo, useEffect } from "react";
import { AnimationEngineProvider, useAnimationRegistration } from '../gameplay/animations';
import { DevToolsPanel } from '../gameplay/animations/animation-devtools';
import { ViewModeProvider, useViewMode } from '../gameplay/game-board/view-mode';
import { useCardAnimationEffects } from './use-card-animation-effects';
import styles from "./card-visibility-sandbox.module.css";

interface SandboxCardProps {
  card: {
    word: string;
    teamName: string;
    selected: boolean;
  };
  index: number;
  onSelect?: () => void;
}

const SandboxCard: React.FC<SandboxCardProps> = ({ card, index, onSelect }) => {
  const { viewMode } = useViewMode();

  const entityContext = useMemo(() => ({
    teamName: card.teamName,
    selected: card.selected,
    viewMode,
    index,
  }), [card.teamName, card.selected, viewMode, index]);

  const { createAnimationRef, triggerTransition } = useAnimationRegistration(
    card.word,
    entityContext,
    {
      entryTransition: 'deal',
      onComplete: (event) => {
        console.log(`[${card.word}] Animation completed: ${event}`);
      },
    }
  );

  const { isAnimating } = useCardAnimationEffects(
    card,
    viewMode,
    triggerTransition
  );

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
        pointerEvents: isAnimating ? 'none' : 'auto',
      }}
      onClick={onSelect}
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
      {viewMode === 'spymaster' && !card.selected && (
        <div
          ref={createAnimationRef('overlay', overlayAnimations)}
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '4px',
            backgroundColor: teamColor,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

const DealInScene: React.FC = () => {
  const [cards, setCards] = useState<Array<{ word: string; teamName: string; selected: boolean }>>([]);

  const mockCards = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      word: `CARD-${i + 1}`,
      teamName: 'neutral',
      selected: false,
    })),
    []
  );

  useEffect(() => {
    setCards(mockCards);
  }, [mockCards]);

  const handleReset = () => {
    setCards([]);
    setTimeout(() => setCards(mockCards), 100);
  };

  return (
    <div className={styles.scene}>
      <h2>Deal Animation - 4x4 Grid</h2>
      <p className={styles.description}>
        Cards fly in from top with stagger based on position
      </p>

      <div className={styles.controls}>
        <button onClick={handleReset}>🔄 Reset</button>
      </div>

      <div className={styles.grid} style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {cards.map((card, index) => (
          <SandboxCard key={card.word} card={card} index={index} />
        ))}
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const [cards, setCards] = useState<Array<{ word: string; teamName: string; selected: boolean }>>([]);
  const { viewMode, toggleViewMode } = useViewMode();

  const mockCards = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      word: `SPY-${i + 1}`,
      teamName: (['red', 'blue', 'neutral', 'assassin'] as const)[i % 4],
      selected: false,
    })),
    []
  );

  useEffect(() => {
    setCards(mockCards);
  }, [mockCards]);

  const handleReset = () => {
    setCards([]);
    setTimeout(() => setCards(mockCards), 100);
  };

  return (
    <div className={styles.scene}>
      <h2>Spymaster View Toggle</h2>
      <p className={styles.description}>
        Toggle to reveal/hide team colors with animation
      </p>

      <div className={styles.controls}>
        <button onClick={toggleViewMode}>
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
        {cards.map((card, index) => (
          <SandboxCard key={card.word} card={card} index={index} />
        ))}
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC = () => {
  const [card, setCard] = useState<{ word: string; teamName: string; selected: boolean }>({
    word: 'SELECT',
    teamName: 'neutral',
    selected: false,
  });

  const handleSelect = () => {
    setCard(prev => ({ ...prev, selected: true }));
  };

  const handleReset = () => {
    setCard({ word: 'SELECT', teamName: 'neutral', selected: false });
  };

  return (
    <div className={styles.scene}>
      <h2>Player Selection</h2>
      <p className={styles.description}>
        Card flips to reveal team color when selected
      </p>

      <div className={styles.controls}>
        <button onClick={handleSelect} disabled={card.selected}>
          Select Card
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: '1fr', maxWidth: '200px', margin: '0 auto' }}>
        <SandboxCard card={card} index={0} onSelect={handleSelect} />
      </div>
    </div>
  );
};

const TimingTestScene: React.FC = () => {
  const [card, setCard] = useState<{ word: string; teamName: string; selected: boolean }>({
    word: 'TIMING-1',
    teamName: 'blue',
    selected: false,
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSelect = async () => {
    setIsSelecting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCard(prev => ({ ...prev, selected: true }));
    setIsSelecting(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setCard({ word: 'TIMING-1', teamName: 'blue', selected: false });
    await new Promise(resolve => setTimeout(resolve, 100));
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
          onClick={handleSelect}
          disabled={isSelecting || isResetting || card.selected}
        >
          {isSelecting ? '⏳ Selecting...' : '👆 Select Card'}
        </button>

        <button
          onClick={handleReset}
          disabled={isSelecting || isResetting}
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
        <div>Card state: "{card.word}" ({card.selected ? '✅ selected' : '⭕ not selected'})</div>
        <div>Is selecting: {isSelecting ? '✅' : '❌'}</div>
        <div>Is resetting: {isResetting ? '✅' : '❌'}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', minHeight: '200px' }}>
        <SandboxCard card={card} index={0} />
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

  return (
    <div className={styles.sandbox}>
      <header className={styles.header}>
        <h1>Card Visibility System</h1>
        <nav className={styles.nav}>
          <button
            onClick={() => setActiveScene("deal")}
            className={activeScene === "deal" ? styles.active : ""}
          >
            Deal Animation
          </button>
          <button
            onClick={() => setActiveScene("spymaster")}
            className={activeScene === "spymaster" ? styles.active : ""}
          >
            Spymaster View
          </button>
          <button
            onClick={() => setActiveScene("selection")}
            className={activeScene === "selection" ? styles.active : ""}
          >
            Player Selection
          </button>
          <button
            onClick={() => setActiveScene("timing")}
            className={activeScene === "timing" ? styles.active : ""}
          >
            Timing Test
          </button>
        </nav>
      </header>

      {activeScene === "deal" && <DealInScene />}
      {activeScene === "spymaster" && <SpymasterViewScene />}
      {activeScene === "selection" && <PlayerSelectionScene />}
      {activeScene === "timing" && <TimingTestScene />}
    </div>
  );
};

export const CardVisibilitySandbox: React.FC = () => {
  return (
    <AnimationEngineProvider engineId="sandbox">
      <ViewModeProvider>
        <SandboxContent />
        <DevToolsPanel defaultOpen={true} theme="dark" />
      </ViewModeProvider>
    </AnimationEngineProvider>
  );
};

export default CardVisibilitySandbox;
