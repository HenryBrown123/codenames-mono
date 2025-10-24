// Stub export for backward compatibility with game components
// This is a temporary shim while game components are being refactored

import { useMemo } from 'react';
import { useSandboxStore } from './card-visibility-sandbox.hooks';
import { useAnimationRegistration } from '../gameplay/animations';

export function useSandboxCardVisibility(word: string, index: number) {
  const card = useSandboxStore(s => s.cards.get(word));

  const entityContext = useMemo(
    () => ({
      teamName: card?.teamName,
      selected: card?.selected,
      index,
    }),
    [card?.teamName, card?.selected, index]
  );

  const { createAnimationRef } = useAnimationRegistration(word, entityContext);

  return {
    card,
    displayState: card?.displayState || 'hidden',
    createAnimationRef,
  };
}
