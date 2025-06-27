import { useState, useCallback } from "react";

export interface StateMachine<TState extends string, TTrigger extends string> {
  initial: TState;
  transitions: Record<TState, Partial<Record<TTrigger, TState>>>;
}

/**
 * Hook for managing animation states via state machine pattern.
 * Uses React state to ensure UI updates when animations change.
 */
export const useAnimationState = <TState extends string, TTrigger extends string>(
  machine: StateMachine<TState, TTrigger>
) => {
  const [states, setStates] = useState<Map<string, TState>>(new Map());
  
  const getState = useCallback((id: string): TState => {
    return states.get(id) || machine.initial;
  }, [states, machine.initial]);
  
  const send = useCallback((id: string, trigger: TTrigger): TState => {
    const currentState = states.get(id) || machine.initial;
    const nextState = machine.transitions[currentState]?.[trigger];

    console.log(`[ANIMATION STATE] ${id}: ${currentState} + ${trigger} = ${nextState || 'NO TRANSITION'}`);
    
    if (nextState) {
      setStates(prev => {
        const newMap = new Map(prev);
        newMap.set(id, nextState);
        return newMap;
      });
      return nextState;
    }
    
    return currentState;
  }, [states, machine]);
  
  const reset = useCallback((id?: string) => {
    if (id) {
      console.log(`[ANIMATION STATE] Resetting state for: ${id}`);
      setStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } else {
      console.log(`[ANIMATION STATE] Resetting all states`);
      setStates(new Map());
    }
  }, []);
  
  return { getState, send, reset };
};