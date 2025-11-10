import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./game-over-layouts-sandbox.module.css";

type GameOverPhase = "idle" | "flash" | "stats";
type TeamColor = "red" | "blue" | "neutral" | "assassin";

interface MockCard {
  word: string;
  team: TeamColor;
  isSelected: boolean;
}

const MOCK_GAME_DATA = {
  winner: "Red Team",
  loser: "Blue Team",
  finalScore: { red: 9, blue: 5 },
  totalTurns: 12,
  cardsRevealed: 18,
};

const FLASH_DURATION = 1500;
const BOARD_REVEAL_DELAY = 2.0;
const DASHBOARD_REVEAL_DELAY = 2.1;

// Mock cards with team assignments
const MOCK_CARDS: MockCard[] = [
  { word: "HACK", team: "red", isSelected: true },
  { word: "CODE", team: "blue", isSelected: false },
  { word: "CYBER", team: "red", isSelected: true },
  { word: "DATA", team: "neutral", isSelected: false },
  { word: "VIRUS", team: "blue", isSelected: false },
  { word: "SERVER", team: "red", isSelected: true },
  { word: "NETWORK", team: "neutral", isSelected: false },
  { word: "BREACH", team: "red", isSelected: true },
  { word: "FIREWALL", team: "blue", isSelected: false },
  { word: "TERMINAL", team: "red", isSelected: true },
  { word: "PROTOCOL", team: "neutral", isSelected: false },
  { word: "ACCESS", team: "red", isSelected: true },
  { word: "SYSTEM", team: "assassin", isSelected: false },
  { word: "OVERRIDE", team: "red", isSelected: true },
  { word: "ENCRYPT", team: "neutral", isSelected: false },
  { word: "DECRYPT", team: "blue", isSelected: false },
  { word: "SIGNAL", team: "red", isSelected: true },
  { word: "ROUTER", team: "neutral", isSelected: false },
  { word: "CACHE", team: "red", isSelected: true },
  { word: "PIXEL", team: "neutral", isSelected: false },
  { word: "MATRIX", team: "blue", isSelected: false },
  { word: "KERNEL", team: "neutral", isSelected: false },
  { word: "UPLOAD", team: "neutral", isSelected: false },
  { word: "DEBUG", team: "neutral", isSelected: false },
  { word: "PROXY", team: "neutral", isSelected: false },
];

const victoryFlashVariants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeIn" as const,
      delay: 1,
    },
  },
};

const glitchVariants = {
  initial: { x: 0, y: 0 },
  animate: {
    x: [-3, 3, 0, 3, -3, 0],
    y: [3, -3, 0, -3, 3, 0],
    transition: {
      duration: 0.3,
      delay: 0.2,
      ease: "easeInOut" as const,
    },
  },
};

const boardVariants = {
  idle: {},
  revealed: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: BOARD_REVEAL_DELAY,
    },
  },
};

const unselectedCardVariants = {
  idle: {},
  revealed: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    },
  },
};

const selectedCardVariants = {
  idle: {
    rotateY: 180,
  },
  revealed: {
    rotateY: 180,
  },
};

const overlayVariants = {
  idle: {
    opacity: 0,
  },
  revealed: {
    opacity: 1,
    transition: {
      delay: 0.16,
      duration: 0.4,
    },
  },
};

const wordVariants = {
  idle: {
    opacity: 0,
    scale: 0.95,
  },
  revealed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 20,
    },
  },
};

const dashboardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      delay: DASHBOARD_REVEAL_DELAY,
      staggerChildren: 0.1,
      delayChildren: DASHBOARD_REVEAL_DELAY + 0.2,
    },
  },
};

const statItemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export const GameOverLayoutsSandbox = () => {
  const [phase, setPhase] = useState<GameOverPhase>("idle");

  const handleTriggerGameOver = () => {
    setPhase("flash");
  };

  const handleReset = () => {
    setPhase("idle");
  };

  useEffect(() => {
    if (phase === "flash") {
      const timer = setTimeout(() => {
        setPhase("stats");
      }, FLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className={styles.sandbox}>
      {/* Floating controls overlay */}
      <div className={styles.floatingControls}>
        <div className={styles.layoutLabel}>Staggered Fade Reveal</div>
      </div>

      {/* Victory/Defeat Flash Overlay */}
      <AnimatePresence>
        {phase === "flash" && <VictoryFlash winner={MOCK_GAME_DATA.winner} />}
      </AnimatePresence>

      {/* Desktop-style layout: dashboard on left, board on right */}
      <div className={styles.gameContainer}>
        {/* Dashboard Area (left side on desktop) */}
        <div className={styles.dashboardArea}>
          <AnimatePresence mode="wait">
            {phase === "idle" ? (
              <motion.div
                key="normal"
                className={styles.normalDashboard}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.terminalHeader}>MISSION CONTROL</div>
                <div className={styles.terminalContent}>
                  <p>&gt; Waiting for orders...</p>
                  <p>&gt; Systems operational</p>
                  <p>&gt; 9 RED selected (backs showing)</p>
                  <p>&gt; 16 unselected (will fade reveal)</p>
                </div>
                <button className={styles.actionButton} onClick={handleTriggerGameOver}>
                  TRIGGER GAME OVER
                </button>
              </motion.div>
            ) : phase === "stats" ? (
              <GameOverDashboard key="gameover" data={MOCK_GAME_DATA} onReset={handleReset} />
            ) : null}
          </AnimatePresence>
        </div>

        {/* Board Area (right side on desktop, above on mobile) */}
        <div className={styles.mockBoard}>
          <motion.div
            className={styles.boardGrid}
            variants={boardVariants}
            initial="idle"
            animate={phase === "stats" ? "revealed" : "idle"}
          >
            {MOCK_CARDS.map((card) => (
              <MockCard key={card.word} card={card} phase={phase} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const VictoryFlash = ({ winner }: { winner: string }) => {
  const isRed = winner.includes("Red");
  const teamColor = isRed ? "var(--color-team-red)" : "var(--color-team-blue)";

  return (
    <motion.div
      className={styles.victoryFlash}
      style={{ "--flash-color": teamColor } as React.CSSProperties}
      variants={victoryFlashVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className={styles.flashContent}
        variants={glitchVariants}
        initial="initial"
        animate="animate"
      >
        <div className={styles.flashStatus}>MISSION COMPLETE</div>
        <div className={styles.flashWinner}>{winner.toUpperCase()}</div>
        <div className={styles.flashSubtext}>VICTORIOUS</div>
      </motion.div>
    </motion.div>
  );
};

const MockCard = ({ card, phase }: { card: MockCard; phase: GameOverPhase }) => {
  const teamColor =
    card.team === "red"
      ? "var(--color-team-red)"
      : card.team === "blue"
        ? "var(--color-team-blue)"
        : card.team === "assassin"
          ? "var(--color-assassin)"
          : "var(--color-neutral)";

  if (card.isSelected) {
    // Selected cards show team color backs (already flipped in gameplay)
    return (
      <motion.div
        className={styles.mockCard}
        style={
          {
            transformStyle: "preserve-3d",
            "--team-color": teamColor,
          } as React.CSSProperties
        }
        variants={selectedCardVariants}
      >
        {/* Front face - hidden when flipped */}
        <div className={styles.cardFront} style={{ opacity: 0 }}>
          <div className={styles.cardContent}>
            <span className={styles.cardWord}>{card.word}</span>
          </div>
        </div>

        {/* Back face showing */}
        <div className={styles.cardBack}>
          <div className={styles.coverContent}>
            <div className={styles.teamSymbol}>{card.team === "red" ? "★" : "♦"}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Unselected cards: fade in overlay
  return (
    <motion.div
      className={styles.mockCard}
      style={{ "--team-color": teamColor } as React.CSSProperties}
      variants={unselectedCardVariants}
    >
      {/* Card stays face-up */}
      <div className={styles.cardFront}>
        <div className={styles.cardContent}>
          <span className={styles.cardWord}>{card.word}</span>
        </div>

        {/* Overlay always present, animates in with stagger */}
        <motion.div
          className={styles.revealOverlay}
          initial="idle"
          animate={phase === "stats" ? "revealed" : "idle"}
          style={{ "z-index": 100 } as React.CSSProperties}
        >
          <motion.div className={styles.teamColorFilter} variants={overlayVariants} />
          <motion.span className={styles.overlayWord} variants={wordVariants}>
            {card.word}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};

const GameOverDashboard = ({
  data,
  onReset,
}: {
  data: typeof MOCK_GAME_DATA;
  onReset: () => void;
}) => (
  <motion.div
    className={styles.gameOverDashboard}
    variants={dashboardVariants}
    initial="hidden"
    animate="visible"
  >
    <motion.div variants={statItemVariants}>
      <div className={styles.terminalHeader}>MISSION COMPLETE</div>
    </motion.div>

    <motion.div className={styles.scoreComparison} variants={statItemVariants}>
      <div className={styles.teamScore}>
        <div className={styles.teamName}>RED TEAM</div>
        <div className={`${styles.score} ${styles.red}`}>{data.finalScore.red}</div>
      </div>
      <div className={styles.scoreDivider}>—</div>
      <div className={styles.teamScore}>
        <div className={styles.teamName}>BLUE TEAM</div>
        <div className={`${styles.score} ${styles.blue}`}>{data.finalScore.blue}</div>
      </div>
    </motion.div>

    <motion.div className={styles.secondaryStats} variants={statItemVariants}>
      <div className={styles.miniStat}>
        <span>{data.totalTurns}</span> TURNS
      </div>
      <div className={styles.miniStat}>
        <span>{data.cardsRevealed}</span> / 25 REVEALED
      </div>
    </motion.div>

    <motion.button className={styles.actionButton} onClick={onReset} variants={statItemVariants}>
      NEW MISSION
    </motion.button>
  </motion.div>
);

export default GameOverLayoutsSandbox;
