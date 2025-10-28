/**
 * Visual state types for card animation state machine
 */

export type VisualCardState =
  | "hidden"    // Before deal
  | "visible"   // After deal, before interaction
  | "selected"  // After click (optional - can skip straight to revealed)
  | "revealed"; // After reveal animation

export type CardTransition =
  | "deal"      // hidden → visible
  | "select"    // visible → selected (optional)
  | "reveal";   // visible/selected → revealed
