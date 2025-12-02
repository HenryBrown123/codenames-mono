# Frontend Refactor: Presentational vs Business Logic Separation

## Goal

Split components into presentational (View) and business logic (Connected) patterns. Keep both in the same file but clearly separated. Each file should have a concise JSDoc comment at the top describing what it does.

## Pattern

```tsx
import React from "react";
import styles from "./my-component.module.css";

/**
 * Brief description of what this component does
 */

export interface MyComponentViewProps {
  // Pre-computed display values - NO raw data that needs logic
  isVisible: boolean;
  displayText: string;
  onAction?: () => void;
}

export const MyComponentView: React.FC<MyComponentViewProps> = ({
  isVisible,
  displayText,
  onAction,
}) => (
  // Pure JSX - no logic, no derived values, just render props directly
  <div>{isVisible && <span onClick={onAction}>{displayText}</span>}</div>
);

export const MyComponent: React.FC = () => {
  // All hooks, data fetching, mutations
  const { data } = useSomeQuery();
  const mutation = useSomeMutation();

  // ALL logic lives here - derive everything the view needs
  const isVisible = data?.status === "active" && !mutation.isPending;
  const displayText = data?.name ?? "Loading...";

  return (
    <MyComponentView
      isVisible={isVisible}
      displayText={displayText}
      onAction={() => mutation.mutate()}
    />
  );
};
```

## Rules

1. **DO NOT** create new files - split within existing files
2. **DO NOT** add unnecessary comments - only add one JSDoc after imports
3. **View components are DUMB** - they receive pre-computed values, not raw data
   - ❌ Bad: `aiStatus: AiStatus` then `const isThinking = aiStatus.thinking`
   - ✅ Good: `isThinking: boolean` (parent computes it)
4. **Connected components own ALL logic** - derive display values before passing to View
5. Skip files that are already pure presentational or don't need splitting
6. Skip context providers, route definitions, and utility files

---

## Checklist

### AI Components

- [x] `src/ai/components/ai-status-indicator.tsx`
  - JSDoc: `/** AI thinking indicator with expandable chat log panel */`

### App / Routes

- [x] `src/app/index.tsx` - SKIP (app entry point)
- [x] `src/app/routes/app-routes.tsx` - SKIP (route definitions)
- [x] `src/app/routes/create-game-route.tsx` - SKIP (route wrapper)
- [x] `src/app/routes/gameplay-route.tsx` - SKIP (route wrapper)
- [x] `src/app/routes/guest-auth-route.tsx` - SKIP (route wrapper)
- [x] `src/app/routes/lobby-route.tsx` - SKIP (route wrapper)
- [x] `src/app/routes/page-layout/menu.tsx`
  - JSDoc: `/** Navigation menu with game controls and settings */`
- [x] `src/app/routes/page-layout/page-layout.tsx`
  - JSDoc: `/** Main page layout wrapper with header and content area */`

### Chat Components

- [x] `src/chat/components/game-chat-log.tsx`
  - JSDoc: `/** Scrollable chat log with typewriter effect for AI messages */`

### Game Access

- [x] `src/game-access/api/query-hooks/use-create-new-game.tsx` - SKIP (hook file)
- [x] `src/game-access/pages/create-game-page-content.tsx`
  - JSDoc: `/** Game creation form with mode selection and AI options */`
- [x] `src/game-access/pages/guest-auth-page-content.tsx`
  - JSDoc: `/** Guest authentication form for joining games */`

### Gameplay - Animations

- [x] `src/gameplay/animations/animation-devtools.tsx` - SKIP (devtools)
- [x] `src/gameplay/animations/animation-engine-context.tsx` - SKIP (context provider)

### Gameplay - Device Mode

- [x] `src/gameplay/device-mode/device-handoff-overlay.tsx`
  - JSDoc: `/** Overlay prompting device handoff between players */`
- [x] `src/gameplay/device-mode/device-mode-manager.tsx` - SKIP (already clean)
  - JSDoc: `/** Manages single-device turn-based player switching */`

### Gameplay - Game Actions

- [x] `src/gameplay/game-actions/game-actions-provider.tsx` - SKIP (context provider)

### Gameplay - Game Board

- [x] `src/gameplay/game-board/boards/board-layout.tsx`
  - JSDoc: `/** Grid layout container for game cards */`
- [x] `src/gameplay/game-board/boards/codebreaker-board.tsx`
  - JSDoc: `/** Game board view for codebreaker role with card selection */`
- [x] `src/gameplay/game-board/boards/spectator-board.tsx`
  - JSDoc: `/** Read-only game board view for spectators */`
- [x] `src/gameplay/game-board/boards/spymaster-board.tsx`
  - JSDoc: `/** Game board view for spymaster with color reveals */`
- [x] `src/gameplay/game-board/cards/floating-word.tsx`
  - JSDoc: `/** Animated floating word with 3D tilt effect */`
- [x] `src/gameplay/game-board/cards/game-card.tsx`
  - JSDoc: `/** Individual game card with selection and reveal states */`
- [x] `src/gameplay/game-board/cards/overlays/game-over-overlay.tsx`
  - JSDoc: `/** Card overlay shown when game ends */`
- [x] `src/gameplay/game-board/cards/overlays/overlay-shared-components.tsx` - SKIP (shared components)
- [x] `src/gameplay/game-board/cards/overlays/shared-components.tsx` - SKIP (shared components)
- [x] `src/gameplay/game-board/cards/overlays/spymaster-overlay.tsx`
  - JSDoc: `/** Card overlay showing secret colors for spymaster */`
- [x] `src/gameplay/game-board/view-mode/view-mode-context.tsx` - SKIP (context provider)

### Gameplay - Game Controls / Dashboards

- [x] `src/gameplay/game-controls/dashboards/game-dashboard.tsx`
  - JSDoc: `/** Main dashboard container that renders role-specific panels */`
- [x] `src/gameplay/game-controls/dashboards/panel-renderer.tsx`
  - JSDoc: `/** Renders panel components from configuration */`

### Gameplay - Game Controls / Panels

- [x] `src/gameplay/game-controls/dashboards/panels/ai-status-panel.tsx`
  - JSDoc: `/** Panel showing AI thinking status and chat history */`
- [x] `src/gameplay/game-controls/dashboards/panels/ar-reveal-button.tsx`
  - JSDoc: `/** Button to temporarily reveal spymaster view */`
- [x] `src/gameplay/game-controls/dashboards/panels/ar-toggle-panel.tsx`
  - JSDoc: `/** Toggle switch for enhanced spymaster vision mode */`
- [x] `src/gameplay/game-controls/dashboards/panels/ar-toggle-switch.tsx`
  - JSDoc: `/** Styled toggle switch for AR mode */`
- [x] `src/gameplay/game-controls/dashboards/panels/codebreaker-actions-panel.tsx`
  - JSDoc: `/** Action buttons for codebreaker: confirm guess, end turn */`
- [x] `src/gameplay/game-controls/dashboards/panels/codemaster-actions-panel.tsx`
  - JSDoc: `/** Action panel for codemaster: shows current clue or waiting state */`
- [x] `src/gameplay/game-controls/dashboards/panels/codemaster-input.tsx`
  - JSDoc: `/** Form input for codemaster to submit clue and number */`
- [x] `src/gameplay/game-controls/dashboards/panels/gameover-panel.tsx`
  - JSDoc: `/** End-of-game panel with winner announcement and play again option */`
- [x] `src/gameplay/game-controls/dashboards/panels/intel-panel.tsx`
  - JSDoc: `/** Intelligence panel showing remaining cards by team */`
- [x] `src/gameplay/game-controls/dashboards/panels/lobby-actions-panel.tsx`
  - JSDoc: `/** Pre-game actions: role selection and ready status */`
- [x] `src/gameplay/game-controls/dashboards/panels/observer-panel.tsx`
  - JSDoc: `/** Panel for spectators showing current game state */`
- [x] `src/gameplay/game-controls/dashboards/panels/team-header-panel.tsx`
  - JSDoc: `/** Team header with symbol and turn indicator */`
- [x] `src/gameplay/game-controls/dashboards/panels/team-symbol-header.tsx`
  - JSDoc: `/** Animated team symbol with color theming */`
- [x] `src/gameplay/game-controls/dashboards/shared/terminal-components.tsx` - SKIP (shared styled components)

### Gameplay - Game Controls / Other

- [x] `src/gameplay/game-controls/desktop-sidebar.tsx`
  - JSDoc: `/** Desktop sidebar container for dashboard and settings */`
- [x] `src/gameplay/game-controls/settings/font-size-control.tsx`
  - JSDoc: `/** Slider control for adjusting card font size */`
- [x] `src/gameplay/game-controls/settings/tilt-control.tsx`
  - JSDoc: `/** Slider control for adjusting card 3D tilt amount */`
- [x] `src/gameplay/game-controls/settings/ui-settings-dashboard.tsx`
  - JSDoc: `/** Settings panel for UI customization options */`

### Gameplay - Game Data Providers

- [x] `src/gameplay/game-data/providers/game-data-provider.tsx` - SKIP (context provider)
- [x] `src/gameplay/game-data/providers/gameplay.provider.tsx` - SKIP (context provider)
- [x] `src/gameplay/game-data/providers/player-context-provider.tsx` - SKIP (context provider)
- [x] `src/gameplay/game-data/providers/turn-data-provider.tsx` - SKIP (context provider)

### Gameplay - Game Over

- [x] `src/gameplay/game-over/game-over-overlay.tsx`
  - JSDoc: `/** Full-screen overlay announcing game winner */`
- [x] `src/gameplay/game-over/victory-flash.tsx`
  - JSDoc: `/** Victory celebration flash animation */`

### Gameplay - Game Scene

- [x] `src/gameplay/game-scene/game-scene.tsx`
  - JSDoc: `/** Main game scene orchestrating board and controls */`
- [x] `src/gameplay/game-scene/scene-provider.tsx` - SKIP (context provider)

### Gameplay - Main Page

- [x] `src/gameplay/gameplay-page.tsx`
  - JSDoc: `/** Top-level gameplay page with all providers */`

### Gameplay - Shared Components

- [x] `src/gameplay/shared/components/action-button/action-button.tsx`
  - JSDoc: `/** Primary action button with loading state */`
- [x] `src/gameplay/shared/components/error-message/error-message.tsx`
  - JSDoc: `/** Error message display component */`
- [x] `src/gameplay/shared/components/loading-spinner/loading-spinner.tsx`
  - JSDoc: `/** Animated loading spinner with text */`
- [x] `src/gameplay/shared/components/status-dot.tsx`
  - JSDoc: `/** Glowing status indicator dot */`
- [x] `src/gameplay/shared/game-instructions/game-instructions.tsx`
  - JSDoc: `/** Game instructions with typewriter animation */`

### Index

- [x] `src/index.tsx` - SKIP (app entry point)

### Lib

- [x] `src/lib/websocket/websocket-context.tsx` - SKIP (context provider)

### Lobby Components

- [x] `src/lobby/components/add-player-input.tsx`
  - JSDoc: `/** Text input with add button for adding players to a team */`
- [x] `src/lobby/components/join-area.tsx`
  - JSDoc: `/** Form for new players to enter their name and choose a team */`
- [x] `src/lobby/components/lobby-header.tsx`
  - JSDoc: `/** Lobby title bar showing game ID and player count */`
- [x] `src/lobby/components/my-team-box.tsx`
  - JSDoc: `/** Shows the current player's team assignment with team switching */`
- [x] `src/lobby/components/player-tile.tsx`
  - JSDoc: `/** Individual player row - read-only in multi-device, draggable/editable in single-device */`
- [x] `src/lobby/components/start-button.tsx`
  - JSDoc: `/** Start game button - disabled until minimum player requirements are met */`
- [x] `src/lobby/components/team-tile.tsx`
  - JSDoc: `/** Team card displaying player list with optional drag-drop support */`
- [x] `src/lobby/components/teams-grid.tsx`
  - JSDoc: `/** Grid layout for team tiles */`

### Lobby Main

- [x] `src/lobby/lobby-page.tsx`
  - JSDoc: `/** Lobby page routing between single and multi-device modes */`
- [x] `src/lobby/multi-device-lobby.tsx`
  - JSDoc: `/** Lobby for multi-device play with join controls */`
- [x] `src/lobby/single-device-lobby.tsx`
  - JSDoc: `/** Lobby for single-device play with drag-drop team management */`
- [x] `src/lobby/team-symbol.tsx`
  - JSDoc: `/** Team logo symbol with optional button behavior */`

### Sandbox (Low Priority)

- [x] `src/sandbox/bouncing-ball-demo.tsx` - SKIP (demo)
- [x] `src/sandbox/card-visibility-sandbox.tsx` - SKIP (demo)
- [x] `src/sandbox/dashboard-sandbox.tsx` - SKIP (demo)
- [x] `src/sandbox/game-over-layouts-sandbox.tsx` - SKIP (demo)
- [x] `src/sandbox/mock-providers.tsx` - SKIP (test utilities)
- [x] `src/sandbox/music-visualiser-animation/control-panel.tsx` - SKIP (demo)
- [x] `src/sandbox/music-visualiser-animation/equalizer-components.tsx` - SKIP (demo)
- [x] `src/sandbox/music-visualiser-animation/music-visualiser-demo.tsx` - SKIP (demo)
- [x] `src/sandbox/music-visualiser-animation/visualizer-display.tsx` - SKIP (demo)
- [x] `src/sandbox/ripple-grid-demo.tsx` - SKIP (demo)
- [x] `src/sandbox/sandbox-panels.tsx` - SKIP (demo)
- [x] `src/sandbox/spring-test.tsx` - SKIP (demo)

---

## Progress Summary

- **Total files**: 89
- **Completed**: 89 ✅
- **Remaining**: 0
- **Skipped**: ~40 (providers, routes, demos, utilities, devtools)
