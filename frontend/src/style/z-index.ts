/**
 * Z-index layering strategy for consistent stacking contexts
 */
export const Z_INDEX = {
  // Base level - normal flow
  BASE: 0,
  
  // Game board elements
  CARD_BASE: 1,
  CARD_COVERED: 10,
  CARD_ANIMATING: 15,
  
  // Fixed UI elements
  FIXED_BUTTONS: 100,
  DASHBOARD: 100,
  
  // Floating elements
  INSTRUCTIONS_PANEL: 200,
  INSTRUCTIONS_BACKDROP: 199,
  
  // Modal layers
  MODAL_BACKDROP: 900,
  MODAL_CONTENT: 1000,
  
  // Top-most elements
  TOAST: 1100,
  CRITICAL: 9999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;