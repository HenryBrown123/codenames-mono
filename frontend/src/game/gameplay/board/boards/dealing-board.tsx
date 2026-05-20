import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { DealInitialState } from "../deal-animation-context";
import type { SceneState } from "../cards/card-animation-variants";

const dealBoardVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Per-card variants for the deal-in animation — cards fly in from
 * the top-left, spring-settle into place, and apply with a 50ms
 * stagger across the grid.
 */
export const dealCardVariants = {
  hidden: {
    opacity: 0,
    x: "-50vw",
    y: "-80vh",
    rotate: -25,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 260,
      mass: 1.2,
    },
  },
};

interface DealingBoardProps {
  children: ReactNode;
  initialState: DealInitialState;
  animateState: SceneState;
  className?: string;
  wordsKey: string;
}

/**
 * Animated wrapper that staggers its card children in from the deal
 * variants. `wordsKey` is used as the React `key` so a new word list
 * remounts the children (and replays the deal); `animateState`
 * forwards the parent scene's animation mode.
 *
 * @todo Refactor — `DealingBoard` should accept a board content
 *       slot and the initial property as orthogonal concerns.
 */
export const DealingBoard = memo<DealingBoardProps>(
  ({ children, initialState, animateState, className, wordsKey }) => {
    return (
      <motion.div
        key={wordsKey}
        className={className}
        variants={dealBoardVariants}
        initial={initialState === "hidden" ? "hidden" : "visible"}
        animate={animateState}
      >
        {children}
      </motion.div>
    );
  },
);

DealingBoard.displayName = "DealingBoard";
