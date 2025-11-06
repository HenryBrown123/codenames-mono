/**
 * Card Animation Variants
 * 
 * Centralized animation configuration using Framer Motion variants.
 * Type-safe state machines for card animations.
 */

/**
 * Scene-level states - for board orchestration (dealing)
 */
export type SceneState = 'hidden' | 'visible';

/**
 * Scene variants for cards - how cards respond to board state
 */
export const sceneVariants = {
  card: {
    hidden: { 
      opacity: 0, 
      y: -200, 
      rotate: -45,
      scale: 0 
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number]
      }
    }
  }
};

/**
 * Board variants - orchestrates card staggering
 */
export const boardVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

/**
 * Card visibility states - visual presentation layer
 * Independent of React component state
 */
export type CardVisibilityState = 'normal' | 'flipped' | 'revealing';

/**
 * Card state variants - controls flip and reveal animations
 */
export const cardStateVariants = {
  // Container controls 3D flip
  container: {
    normal: { 
      rotateY: 0 
    },
    flipped: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    },
    revealing: { 
      rotateY: 0  // No flip during AR reveal
    }
  },
  
  // Front face visibility during states
  frontFace: {
    normal: { opacity: 1 },
    flipped: { opacity: 1 },
    revealing: { 
      opacity: 0,
      transition: { duration: 0.15 }  // Quick fade for reveal
    }
  }
};

/**
 * AR reveal orchestration - for spymaster overlay elements
 */
export type ARRevealState = 'hidden' | 'visible';

export const arRevealVariants = {
  container: {
    hidden: {
      transition: {
        staggerChildren: 0.03,  // Much faster exit stagger
        staggerDirection: -1,    // Reverse order on exit
      }
    },
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      }
    }
  },
  item: {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2  // Faster exit
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20
      }
    }
  }
};
