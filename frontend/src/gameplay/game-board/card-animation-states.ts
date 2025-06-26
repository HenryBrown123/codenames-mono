import { StateMachine } from "../animation/use-animation-state";

export type CardState = 'hidden' | 'dealing' | 'idle' | 'selecting' | 'covering' | 'covered';
export type CardTrigger = 'deal' | 'finishDeal' | 'select' | 'cover' | 'finishCover' | 'reset';

/**
 * State machine definition for card animations.
 * Describes all valid states and the triggers that transition between them.
 * 
 * State flow:
 * - hidden → dealing → idle (card appears and settles)
 * - idle → selecting (user clicks, strike-through animation)
 * - selecting → covering → covered (server confirms, cover slides in)
 */
export const cardStateMachine: StateMachine<CardState, CardTrigger> = {
  initial: 'hidden',
  transitions: {
    hidden: { deal: 'dealing' },
    dealing: { finishDeal: 'idle' },
    idle: { select: 'selecting' },
    selecting: { cover: 'covering' },
    covering: { finishCover: 'covered' },
    covered: { reset: 'hidden' },
  },
};