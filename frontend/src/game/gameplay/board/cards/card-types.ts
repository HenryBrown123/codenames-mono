import { Variant } from "framer-motion";
import { Card } from "@frontend/shared/types";

/**
 * Discriminated union of board → card display contracts. The mode
 * picks the visual treatment; the second field carries the data each
 * mode needs.
 */
export type CardDisplayOptions =
  | { mode: "gameplay"; clickable: boolean }
  | { mode: "spymaster"; isCurrentTeam: boolean }
  | { mode: "game-over"; isCurrentTeam: boolean };

/** Target visibility states for a single card's overlay animations. */
export type CardVisibilityState =
  | "normal"
  | "flipped"
  | "revealed"
  | "gameOver"
  | "gameOverSelected";

/** Aggregate state passed to each card overlay component. */
export interface CardState {
  display: CardDisplayOptions;
  variant: CardVisibilityState;
}

/** Variant keys every card overlay must implement (visibility + hidden). */
export type OverlayVariantKey = CardVisibilityState | "hidden";

/**
 * Mapped type used to enforce that an overlay variants object
 * implements every key in {@link OverlayVariantKey}.
 */
export type OverlayVariants = Record<OverlayVariantKey, Variant>;

/**
 * Pure mapping from `CardDisplayOptions` + selection state to the
 * animation variant the card should show.
 */
export const deriveCardVariant = (
  displayOptions: CardDisplayOptions,
  isSelected: boolean,
): CardVisibilityState => {
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
 * Pure mapping from board state (view mode, current-team flag,
 * interactability) to the {@link CardDisplayOptions} the board
 * should pass each card.
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
