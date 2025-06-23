/**
 * Gameplay State Management
 *
 * This module provides all state management for the gameplay feature.
 * Uses a composition pattern with three focused providers:
 *
 * 1. GameDataProvider - Handles async data fetching with loading/error states
 * 2. UISceneProvider - Manages UI state machine and scene transitions
 * 3. GameActionsProvider - Centralizes all game actions with unified loading state
 */

// Main composition provider
export { GameplayProvider } from "./gameplay-provider";

// Individual hooks for components
export { useGameData } from "./game-data-provider";
export { usePlayerRoleScene } from "./ui-scene-provider";
export { useGameActions } from "./game-actions-provider";

// Types
export type {
  ActionState,
  ActionName,
  GameActionsContextValue,
} from "./game-actions-provider";
