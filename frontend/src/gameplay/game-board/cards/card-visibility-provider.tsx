/**
 * Card Visibility Provider
 *
 * Manages visibility state for all cards in a centralized store.
 * Each card subscribes to its own state changes via the useCardVisibility hook.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Card } from "@frontend/shared-types";

export type VisualState = "hidden" | "visible" | "visible-colored" | "visible-covered";

export type AnimationType =
  | "deal-in"
  | "spymaster-reveal-in"
  | "spymaster-reveal-out"
  | "cover-card"
  | null;

export interface CardVisibilityData {
  state: VisualState;
  animation: AnimationType;
}

interface CardTransition {
  from: VisualState;
  to: VisualState;
  animation: AnimationType;
  condition: (card: Card, viewMode: "player" | "spymaster") => boolean;
}

/**
 * State machine transitions for card visibility
 */
const CARD_TRANSITIONS: CardTransition[] = [
  // Cards appear with dealing animation
  {
    from: "hidden",
    to: "visible",
    animation: "deal-in",
    condition: () => true,
  },
  // Cards reveal their team colors when in spymaster view
  {
    from: "visible",
    to: "visible-colored",
    animation: "spymaster-reveal-in",
    condition: (card, viewMode) => viewMode === "spymaster" && !!(card.cardType || card.teamName),
  },
  // Cards hide their team colors when leaving spymaster view
  {
    from: "visible-colored",
    to: "visible",
    animation: "spymaster-reveal-out",
    condition: (_, viewMode) => viewMode === "player",
  },
  // Cards cover when selected (from neutral state)
  {
    from: "visible",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected,
  },
  // Cards cover when selected (from colored state)
  {
    from: "visible-colored",
    to: "visible-covered",
    animation: "cover-card",
    condition: (card) => card.selected,
  },
];

interface VisibilityTriggers {
  reveal: (active: boolean) => void;
  toggleSpymasterView: () => void;
}

interface CardVisibilityState {
  getCardVisibility: (word: string) => CardVisibilityData | undefined;
  triggers: VisibilityTriggers;
  viewMode: "player" | "spymaster";
}

const CardVisibilityContext = createContext<CardVisibilityState | null>(null);

interface CardVisibilityProviderProps {
  children: ReactNode;
  cards: Card[];
  initialState: VisualState;
}

/**
 * Provider that manages visibility state for all cards
 * Runs state machine transitions during render for all cards
 */
export const CardVisibilityProvider: React.FC<CardVisibilityProviderProps> = ({
  children,
  cards,
  initialState,
}) => {
  // Track mount/unmount
  useEffect(() => {
    // Component mounted
    return () => {
      // Component unmounted
    };
  }, []);

  const [cardData, setCardData] = useState(() => {
    const initial = new Map<string, CardVisibilityData>();
    cards.forEach((card) => {
      const cardState = card.selected ? "visible-covered" : initialState;
      initial.set(card.word, {
        state: cardState,
        animation: null,
      });
    });
    return initial;
  });

  const [viewMode, setViewMode] = useState<"player" | "spymaster">("player");

  // Run state machine transitions during render
  let hasChanges = false;
  const updatedData = new Map(cardData);

  // Run state machine for all cards

  cards.forEach((card, index) => {
    const currentData = updatedData.get(card.word);
    if (!currentData) {
      // New card, initialize it
      const newState = card.selected ? "visible-covered" : initialState;
      // New card initialized
      updatedData.set(card.word, {
        state: newState,
        animation: null,
      });
      hasChanges = true;
      return;
    }

    // Find applicable transition
    const transition = CARD_TRANSITIONS.find(
      (t) => t.from === currentData.state && t.condition(card, viewMode),
    );

    if (transition && currentData.state !== transition.to) {
      updatedData.set(card.word, {
        state: transition.to,
        animation: transition.animation,
      });
      hasChanges = true;
    }
  });

  // Only update state if there were changes
  if (hasChanges) {
    setCardData(updatedData);
  }

  const getCardVisibility = useCallback(
    (word: string) => {
      const data = cardData.get(word);
      // Return card visibility data
      return data;
    },
    [cardData],
  );

  // Simplified triggers object
  const triggers = {
    reveal: useCallback((active: boolean) => {
      const newMode = active ? "spymaster" : "player";
      setViewMode(newMode);
    }, []),
    toggleSpymasterView: useCallback(() => {
      setViewMode((prev) => {
        const next = prev === "spymaster" ? "player" : "spymaster";
        return next;
      });
    }, []),
  };

  return (
    <CardVisibilityContext.Provider
      value={{
        getCardVisibility,
        triggers,
        viewMode,
      }}
    >
      {children}
    </CardVisibilityContext.Provider>
  );
};

export const useCardVisibilityContext = () => {
  const context = useContext(CardVisibilityContext);
  if (!context) {
    throw new Error("useCardVisibilityContext must be used within CardVisibilityProvider");
  }
  return context;
};
