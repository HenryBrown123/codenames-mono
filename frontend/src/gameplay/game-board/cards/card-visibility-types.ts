export type DisplayState = "hidden" | "visible" | "visible-colored" | "visible-covered";
export type ViewMode = "normal" | "spymaster";
export type CardEvent = "deal" | "select" | "reveal-colors" | "hide-colors" | "reset";

export interface CardState {
  displayState: DisplayState;
  isTransitioning: boolean;
  pendingState?: DisplayState;
}

export interface CardTransition {
  fromState: DisplayState;
  toState: DisplayState;
  event: CardEvent;
}

export interface Transition {
  from: DisplayState;
  to: DisplayState;
  event: CardEvent;
}

export const CARD_TRANSITIONS: Transition[] = [
  { from: "hidden", to: "visible", event: "deal" },
  { from: "visible", to: "visible-colored", event: "reveal-colors" },
  { from: "visible-colored", to: "visible", event: "hide-colors" },
  { from: "visible", to: "visible-covered", event: "select" },
  { from: "visible-colored", to: "visible-covered", event: "select" },
  { from: "visible-covered", to: "hidden", event: "reset" },
  { from: "visible", to: "hidden", event: "reset" },
  { from: "visible-colored", to: "hidden", event: "reset" },
];
