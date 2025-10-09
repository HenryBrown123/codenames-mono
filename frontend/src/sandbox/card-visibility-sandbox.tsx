import React, { useState } from "react";
import { AnimationEngineProvider } from '../gameplay/animations';
import {
  useSandboxStore,
  useSandboxCoordinator,
  useSandboxCardVisibility,
} from "./card-visibility-sandbox.hooks";
import styles from "./card-visibility-sandbox.module.css";

const SandboxCard: React.FC = () => {
  const { card, displayState, createAnimationRef } = useSandboxCardVisibility();

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

  // If no card initialized, show placeholder
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

  // Card exists - render it even if hidden (for animation to work)
  return (
    <div
      ref={createAnimationRef('card', cardAnimations)}
      className={styles.card}
      style={{
        perspective: '1000px',
        width: '200px',
        height: '133px',
        // Start hidden off-screen for deal animation
        ...(displayState === 'hidden' && {
          transform: 'translateY(-100vh)',
          opacity: 0,
        })
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
            background: card.teamName === 'red' ? '#dc2626' :
                       card.teamName === 'blue' ? '#2563eb' :
                       card.teamName === 'neutral' ? '#9ca3af' : '#000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }} />
        </div>
      </div>
    </div>
  );
};

const DealInScene: React.FC = () => {
  const initializeCard = useSandboxStore(state => state.initializeCard);
  const dealCard = useSandboxStore(state => state.dealCard);
  const resetCard = useSandboxStore(state => state.resetCard);

  useSandboxCoordinator();

  const [isDealing, setIsDealing] = useState(false);

  const handleDeal = async () => {
    setIsDealing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    initializeCard('DEAL', 'red');
    dealCard();
    setIsDealing(false);
  };

  const handleReset = async () => {
    resetCard();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className={styles.scene}>
      <h2>Deal Animation</h2>
      <p className={styles.description}>
        Cards fly in from top with rotation and stagger
      </p>

      <div className={styles.controls}>
        <button onClick={handleDeal} disabled={isDealing}>
          {isDealing ? "Dealing..." : "Deal Card"}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: '1fr', maxWidth: '200px', margin: '0 auto' }}>
        <SandboxCard />
      </div>
    </div>
  );
};

const SpymasterViewScene: React.FC = () => {
  const initializeCard = useSandboxStore(state => state.initializeCard);
  const dealCard = useSandboxStore(state => state.dealCard);
  const resetCard = useSandboxStore(state => state.resetCard);

  useSandboxCoordinator();

  const handleDeal = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    initializeCard('SPY', 'blue');
    dealCard();
  };

  const handleReset = async () => {
    resetCard();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className={styles.scene}>
      <h2>Spymaster View</h2>
      <p className={styles.description}>
        Toggle between normal and spymaster views
      </p>

      <div className={styles.controls}>
        <button onClick={handleDeal}>Deal Card</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: '1fr', maxWidth: '200px', margin: '0 auto' }}>
        <SandboxCard />
      </div>
    </div>
  );
};

const PlayerSelectionScene: React.FC = () => {
  const card = useSandboxStore(state => state.card);
  const initializeCard = useSandboxStore(state => state.initializeCard);
  const dealCard = useSandboxStore(state => state.dealCard);
  const selectCard = useSandboxStore(state => state.selectCard);
  const resetCard = useSandboxStore(state => state.resetCard);

  useSandboxCoordinator();

  const handleDeal = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    initializeCard('SELECT', 'neutral');
    dealCard();
  };

  const handleSelect = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    selectCard();
  };

  const handleReset = async () => {
    resetCard();
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
        <SandboxCard />
      </div>
    </div>
  );
};

const TimingTestScene: React.FC = () => {
  const card = useSandboxStore(state => state.card);
  const pendingTransitions = useSandboxStore(state => state.pendingTransitions);
  const initializeCard = useSandboxStore(state => state.initializeCard);
  const dealCard = useSandboxStore(state => state.dealCard);
  const selectCard = useSandboxStore(state => state.selectCard);
  const resetCard = useSandboxStore(state => state.resetCard);

  const [isDealing, setIsDealing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useSandboxCoordinator();

  const handleDeal = async () => {
    console.log('[🔵 TimingTest] Deal clicked');
    setIsDealing(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[🟢 TimingTest] Initializing and dealing');
    initializeCard('TIMING', 'blue');
    dealCard();

    setIsDealing(false);
  };

  const handleSelect = async () => {
    if (!card) return;

    console.log('[🔵 TimingTest] Select clicked');
    setIsSelecting(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('[🟢 TimingTest] Queuing select transition');
    selectCard();

    setIsSelecting(false);
  };

  const handleReset = async () => {
    console.log('[🔄 TimingTest] Reset clicked');
    setIsResetting(true);

    resetCard();

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
        <SandboxCard />
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
  const resetCard = useSandboxStore(state => state.resetCard);

  const handleSceneChange = async (scene: "deal" | "spymaster" | "selection" | "timing") => {
    resetCard();
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
    </AnimationEngineProvider>
  );
};

export default CardVisibilitySandbox;
