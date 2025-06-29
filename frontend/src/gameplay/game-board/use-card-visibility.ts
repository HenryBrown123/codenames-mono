import { useState, useCallback } from 'react';
import { Card } from '@frontend/shared-types';

/**
 * All possible animations for card transitions
 */
export type AnimationType = 'dealing' | 'color-fade' | 'covering';

/**
 * Card states for different roles
 */
export type LobbyCardState = 'hidden' | 'visible';
export type CodebreakerCardState = 'visible' | 'covered';
export type CodemasterCardState = 'visible' | 'visible-colored' | 'covered';
export type CardState = LobbyCardState | CodebreakerCardState | CodemasterCardState;

/**
 * Card visibility info
 */
export interface CardVisibility {
  state: CardState;
  animation: AnimationType | null;
  completeTransition: () => void;
}

/**
 * State transition definition
 */
interface StateTransition<TState> {
  from: TState;
  to: TState;
  animation: AnimationType;
  condition?: (card: Card) => boolean;
}

/**
 * Role configuration
 */
interface RoleConfig<TState> {
  defaultState: (card: Card) => TState;
  transitions: StateTransition<TState>[];
}

/**
 * Lobby transitions - just dealing animation
 */
const LOBBY_CONFIG: RoleConfig<LobbyCardState> = {
  defaultState: () => 'hidden',
  transitions: [
    {
      from: 'hidden',
      to: 'visible',
      animation: 'dealing'
    }
  ]
};

/**
 * Codebreaker transitions - starts visible, can be covered
 */
const CODEBREAKER_CONFIG: RoleConfig<CodebreakerCardState> = {
  defaultState: (card) => card.selected ? 'covered' : 'visible',
  transitions: [
    {
      from: 'visible',
      to: 'covered',
      animation: 'covering',
      condition: (card) => card.selected
    }
  ]
};

/**
 * Codemaster transitions - starts visible, animates to colored
 */
const CODEMASTER_CONFIG: RoleConfig<CodemasterCardState> = {
  defaultState: (card) => card.selected ? 'covered' : 'visible',
  transitions: [
    {
      from: 'visible',
      to: 'visible-colored',
      animation: 'color-fade'
    }
  ]
};

/**
 * Get role configuration
 */
function getRoleConfig(role: 'lobby' | 'codebreaker' | 'codemaster' | 'spectator') {
  switch (role) {
    case 'lobby':
      return LOBBY_CONFIG;
    case 'codemaster':
      return CODEMASTER_CONFIG;
    case 'codebreaker':
    case 'spectator':
    default:
      return CODEBREAKER_CONFIG;
  }
}

interface UseCardVisibilityProps {
  cards: Card[];
  role: 'lobby' | 'codebreaker' | 'codemaster' | 'spectator';
}

/**
 * Hook that tracks card visual states using card identity
 */
export function useCardVisibility({ cards, role }: UseCardVisibilityProps) {
  const config = getRoleConfig(role);
  type RoleCardState = typeof config.defaultState extends (card: Card) => infer R ? R : never;
  
  // Initialize card states by card word
  const [cardStates, setCardStates] = useState<Map<string, RoleCardState>>(() => {
    const initialStates = new Map<string, RoleCardState>();
    cards.forEach(card => {
      initialStates.set(card.word, config.defaultState(card) as RoleCardState);
    });
    return initialStates;
  });
  
  /**
   * Get the current visual state and animation for a card
   */
  const getCardVisibility = useCallback((card: Card): CardVisibility => {
    const state = cardStates.get(card.word) || config.defaultState(card);
    
    // Find applicable transition from current state
    const transition = config.transitions.find(t => 
      t.from === state && (!t.condition || t.condition(card))
    );
    
    return {
      state: state as CardState,
      animation: transition?.animation || null,
      completeTransition: transition ? () => {
        setCardStates(prev => {
          const next = new Map(prev);
          next.set(card.word, transition.to as RoleCardState);
          return next;
        });
      } : () => {}
    };
  }, [cardStates, config]);
  
  return {
    getCardVisibility,
  };
}