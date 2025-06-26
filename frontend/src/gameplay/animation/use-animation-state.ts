import { useRef, useCallback } from "react";

export interface StateMachine<TState extends string, TTrigger extends string> {
  initial: TState;
  transitions: Record<TState, Partial<Record<TTrigger, TState>>>;
}

/**
 * Generic hook for managing animation states via state machine pattern.
 * Uses refs to avoid re-renders and provides a simple API for state transitions.
 * 
 * @param machine - State machine definition with states and valid transitions
 * @returns Object with methods to get current state, send triggers, and reset
 */
export const useAnimationState = <TState extends string, TTrigger extends string>(
  machine: StateMachine<TState, TTrigger>
) => {
  const states = useRef<Map<string, TState>>(new Map());
  
  const getState = useCallback((id: string): TState => {
    return states.current.get(id) || machine.initial;
  }, [machine.initial]);
  
  const send = useCallback((id: string, trigger: TTrigger): TState => {
    const currentState = getState(id);
    const nextState = machine.transitions[currentState]?.[trigger];

    console.log(`[ANIMATION STATE] ${id}: ${currentState} + ${trigger} = ${nextState || 'NO TRANSITION'}`);
    
    
    if (nextState) {
      states.current.set(id, nextState);
      return nextState;
    }
    
    return currentState;
  }, [getState, machine.transitions]);
  
  const reset = useCallback((id?: string) => {
    if (id) {
      states.current.delete(id);
    } else {
      states.current.clear();
    }
  }, []);
  
  return { getState, send, reset };
};