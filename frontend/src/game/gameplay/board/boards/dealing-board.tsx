import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { DealInitialState } from "../deal-animation-context";
import type { SceneState } from "../cards/card-animation-variants";

/**
 * Wrapper component that handles deal animation orchestration
 */

const dealBoardVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

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

/** @todo refactor component.... DealingBoard should be a board that deals given a certain "initial" property */

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
