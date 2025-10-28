import type { VisualCardState, CardTransition } from "./visual-card-state.types";

/**
 * Pure state machine logic for card visual states.
 * Determines next state based on current state + inputs.
 * NO animation logic here - just state transitions.
 */
export function computeVisualCardState(
  currentState: VisualCardState,
  event: string | null,
  isRevealed: boolean,
  dealOnEntry: boolean
): VisualCardState {
  // Deal transition: hidden → visible
  if (currentState === "hidden" && dealOnEntry) {
    return "visible";
  }

  // Skip straight to revealed if card data says so
  // (handles page refresh, late joins, etc)
  if (currentState !== "revealed" && isRevealed) {
    return "revealed";
  }

  // Event-driven transitions
  // "select" event triggers reveal (card flips to show team color)
  if (event === "select") {
    if (currentState === "visible" || currentState === "selected") {
      return "revealed";
    }
  }

  // No transition
  return currentState;
}

/**
 * Get the transition type between two states.
 * Used to look up the correct animation.
 */
export function getTransition(
  from: VisualCardState,
  to: VisualCardState
): CardTransition | null {
  if (from === "hidden" && to === "visible") return "deal";
  if ((from === "visible" || from === "selected") && to === "revealed") return "reveal";

  return null;
}
