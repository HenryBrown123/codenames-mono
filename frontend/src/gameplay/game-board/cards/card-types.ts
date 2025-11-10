import { Variant } from "framer-motion";
import { Card } from "@frontend/shared-types";

/**
 * Display options passed from board to card
 * Discriminated union ensures type safety for each mode
 */
export type CardDisplayOptions =
  | { mode: "gameplay"; clickable: boolean }
  | { mode: "spymaster"; isCurrentTeam: boolean }
  | { mode: "game-over"; isCurrentTeam: boolean };

/**
 * Card visibility states - target states, not actions
 */
export type CardVisibilityState =
  | "normal"
  | "flipped"
  | "revealed"
  | "gameOver"
  | "gameOverSelected";

/**
 * Aggregate card state passed to overlays
 */
export interface CardState {
  display: CardDisplayOptions;
  variant: CardVisibilityState;
}

/**
 * All overlay variant objects must implement these keys
 */
export type OverlayVariantKey = CardVisibilityState | "hidden";

/**
 * Enforces that every state is implemented in variant objects
 */
export type OverlayVariants = Record<OverlayVariantKey, Variant>;

/**
 * Derives animation variant from display options and card data
 */
export const deriveCardVariant = (
  displayOptions: CardDisplayOptions,
  isSelected: boolean,
): CardVisibilityState => {
  console.log("displayOptions", displayOptions);
  if (isSelected) {
    return "flipped";
  }

  if (displayOptions.mode === "game-over") {
    return isSelected ? "gameOverSelected" : "gameOver";
  }
  if (displayOptions.mode === "spymaster") {
    return "revealed";
  }
  return "normal";
};

/**
 * Derives display options from board state
 */
export const deriveDisplayOptions = (params: {
  viewMode: string;
  isCurrentTeam: boolean;
  canInteract: boolean;
}): CardDisplayOptions => {
  const { viewMode, isCurrentTeam, canInteract } = params;

  if (viewMode === "spymaster") {
    return { mode: "spymaster", isCurrentTeam };
  }

  return { mode: "gameplay", clickable: canInteract };
};
