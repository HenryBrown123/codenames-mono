/**
 * Card Visibility Types and Transitions
 *
 * Shared types and state machine definitions for card visibility system.
 */

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
  animationStatus?: "pending" | "playing" | "complete";
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
export const CARD_TRANSITIONS: CardTransition[] = [
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