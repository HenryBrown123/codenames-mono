# Frontend Refactor: Presentational vs Business Logic Separation

## Goal

Split components into presentational (View) and business logic (Connected) patterns. Keep both in the same file but clearly separated. Each file should have a concise JSDoc comment at the top describing what it does.

## Pattern

```tsx
/**
 * Brief description of what this component does
 */

// Props interface for the presentational component
export interface MyComponentViewProps {
  // Pure data + callbacks, no hooks
}

// Presentational component - pure rendering, no hooks except UI state
export const MyComponentView: React.FC<MyComponentViewProps> = (props) => {
  // Only useState for local UI state (hover, focus, etc)
  // No data fetching, no mutations, no context consumption
};

// Connected component - wires up data and passes to view
export const MyComponent: React.FC = () => {
  // Hooks, context, mutations, data fetching
  // Pass everything to the View component
  return <MyComponentView {...viewProps} />;
};
```

## Rules

1. **DO NOT** create new files - split within existing files
2. **DO NOT** add unnecessary comments - only add one JSDoc at the top
3. **View components** receive all data via props (no hooks except local UI state)
4. **Connected components** handle all data fetching, mutations, and context
5. Skip files that are already pure presentational or don't need splitting
6. Skip context providers, route definitions, and utility files

---

## Checklist

### AI Components

- [ ] `src/ai/components/ai-status-indicator.tsx`
  - JSDoc: `/** AI thinking indicator with expandable chat log panel */`

### App / Routes

- [ ] `src/app/index.tsx` - SKIP (app entry point)
- [ ] `src/app/routes/app-routes.tsx` - SKIP (route definitions)
- [ ] `src/app/routes/create-game-route.tsx` - SKIP (route wrapper)
- [ ] `src/app/routes/gameplay-route.tsx` - SKIP (route wrapper)
- [ ] `src/app/routes/guest-auth-route.tsx` - SKIP (route wrapper)
- [ ] `src/app/routes/lobby-route.tsx` - SKIP (route wrapper)
- [ ] `src/app/routes/page-layout/menu.tsx`
  - JSDoc: `/** Navigation menu with game controls and settings */`
- [ ] `src/app/routes/page-layout/page-layout.tsx`
  - JSDoc: `/** Main page layout wrapper with header and content area */`

### Chat Components

- [ ] `src/chat/components/game-chat-log.tsx`
  - JSDoc: `/** Scrollable chat log with typewriter effect for AI messages */`

### Game Access

- [ ] `src/game-access/api/query-hooks/use-create-new-game.tsx` - SKIP (hook file)
- [ ] `src/game-access/pages/create-game-page-content.tsx`
  - JSDoc: `/** Game creation form with mode selection and AI options */`
- [ ] `src/game-access/pages/guest-auth-page-content.tsx`
  - JSDoc: `/** Guest authentication form for joining games */`

### Gameplay - Animations

- [ ] `src/gameplay/animations/animation-devtools.tsx`
  - JSDoc: `/** Developer tools overlay for debugging animations */`
- [ ] `src/gameplay/animations/animation-engine-context.tsx` - SKIP (context provider)

### Gameplay - Device Mode

- [ ] `src/gameplay/device-mode/device-handoff-overlay.tsx`
  - JSDoc: `/** Overlay prompting device handoff between players */`
- [ ] `src/gameplay/device-mode/device-mode-manager.tsx`
  - JSDoc: `/** Manages single-device turn-based player switching */`

### Gameplay - Game Actions

- [ ] `src/gameplay/game-actions/game-actions-provider.tsx` - SKIP (context provider)

### Gameplay - Game Board

- [ ] `src/gameplay/game-board/boards/board-layout.tsx`
  - JSDoc: `/** Grid layout container for game cards */`
- [ ] `src/gameplay/game-board/boards/codebreaker-board.tsx`
  - JSDoc: `/** Game board view for codebreaker role with card selection */`
- [ ] `src/gameplay/game-board/boards/spectator-board.tsx`
  - JSDoc: `/** Read-only game board view for spectators */`
- [ ] `src/gameplay/game-board/boards/spymaster-board.tsx`
  - JSDoc: `/** Game board view for spymaster with color reveals */`
- [ ] `src/gameplay/game-board/cards/floating-word.tsx`
  - JSDoc: `/** Animated floating word with 3D tilt effect */`
- [ ] `src/gameplay/game-board/cards/game-card.tsx`
  - JSDoc: `/** Individual game card with selection and reveal states */`
- [ ] `src/gameplay/game-board/cards/overlays/game-over-overlay.tsx`
  - JSDoc: `/** Card overlay shown when game ends */`
- [ ] `src/gameplay/game-board/cards/overlays/overlay-shared-components.tsx` - SKIP (shared components)
- [ ] `src/gameplay/game-board/cards/overlays/shared-components.tsx` - SKIP (shared components)
- [ ] `src/gameplay/game-board/cards/overlays/spymaster-overlay.tsx`
  - JSDoc: `/** Card overlay showing secret colors for spymaster */`
- [ ] `src/gameplay/game-board/view-mode/view-mode-context.tsx` - SKIP (context provider)

### Gameplay - Game Controls / Dashboards

- [ ] `src/gameplay/game-controls/dashboards/game-dashboard.tsx`
  - JSDoc: `/** Main dashboard container that renders role-specific panels */`
- [ ] `src/gameplay/game-controls/dashboards/panel-renderer.tsx`
  - JSDoc: `/** Renders panel components from configuration */`

### Gameplay - Game Controls / Panels

- [ ] `src/gameplay/game-controls/dashboards/panels/ai-status-panel.tsx`
  - JSDoc: `/** Panel showing AI thinking status and chat history */`
- [ ] `src/gameplay/game-controls/dashboards/panels/ar-reveal-button.tsx`
  - JSDoc: `/** Button to temporarily reveal spymaster view */`
- [ ] `src/gameplay/game-controls/dashboards/panels/ar-toggle-panel.tsx`
  - JSDoc: `/** Toggle switch for enhanced spymaster vision mode */`
- [ ] `src/gameplay/game-controls/dashboards/panels/ar-toggle-switch.tsx`
  - JSDoc: `/** Styled toggle switch for AR mode */`
- [ ] `src/gameplay/game-controls/dashboards/panels/codebreaker-actions-panel.tsx`
  - JSDoc: `/** Action buttons for codebreaker: confirm guess, end turn */`
- [ ] `src/gameplay/game-controls/dashboards/panels/codemaster-actions-panel.tsx`
  - JSDoc: `/** Action panel for codemaster: shows current clue or waiting state */`
- [ ] `src/gameplay/game-controls/dashboards/panels/codemaster-input.tsx`
  - JSDoc: `/** Form input for codemaster to submit clue and number */`
- [ ] `src/gameplay/game-controls/dashboards/panels/gameover-panel.tsx`
  - JSDoc: `/** End-of-game panel with winner announcement and play again option */`
- [ ] `src/gameplay/game-controls/dashboards/panels/intel-panel.tsx`
  - JSDoc: `/** Intelligence panel showing remaining cards by team */`
- [ ] `src/gameplay/game-controls/dashboards/panels/lobby-actions-panel.tsx`
  - JSDoc: `/** Pre-game actions: role selection and ready status */`
- [ ] `src/gameplay/game-controls/dashboards/panels/observer-panel.tsx`
  - JSDoc: `/** Panel for spectators showing current game state */`
- [ ] `src/gameplay/game-controls/dashboards/panels/team-header-panel.tsx`
  - JSDoc: `/** Team header with symbol and turn indicator */`
- [ ] `src/gameplay/game-controls/dashboards/panels/team-symbol-header.tsx`
  - JSDoc: `/** Animated team symbol with color theming */`
- [ ] `src/gameplay/game-controls/dashboards/shared/terminal-components.tsx` - SKIP (shared styled components)

### Gameplay - Game Controls / Other

- [ ] `src/gameplay/game-controls/desktop-sidebar.tsx`
  - JSDoc: `/** Desktop sidebar container for dashboard and settings */`
- [ ] `src/gameplay/game-controls/settings/font-size-control.tsx`
  - JSDoc: `/** Slider control for adjusting card font size */`
- [ ] `src/gameplay/game-controls/settings/tilt-control.tsx`
  - JSDoc: `/** Slider control for adjusting card 3D tilt amount */`
- [ ] `src/gameplay/game-controls/settings/ui-settings-dashboard.tsx`
  - JSDoc: `/** Settings panel for UI customization options */`

### Gameplay - Game Data Providers

- [ ] `src/gameplay/game-data/providers/game-data-provider.tsx` - SKIP (context provider)
- [ ] `src/gameplay/game-data/providers/gameplay.provider.tsx` - SKIP (context provider)
- [ ] `src/gameplay/game-data/providers/player-context-provider.tsx` - SKIP (context provider)
- [ ] `src/gameplay/game-data/providers/turn-data-provider.tsx` - SKIP (context provider)

### Gameplay - Game Over

- [ ] `src/gameplay/game-over/game-over-overlay.tsx`
  - JSDoc: `/** Full-screen overlay announcing game winner */`
- [ ] `src/gameplay/game-over/victory-flash.tsx`
  - JSDoc: `/** Victory celebration flash animation */`

### Gameplay - Game Scene

- [ ] `src/gameplay/game-scene/game-scene.tsx`
  - JSDoc: `/** Main game scene orchestrating board and controls */`
- [ ] `src/gameplay/game-scene/scene-provider.tsx` - SKIP (context provider)

### Gameplay - Main Page

- [ ] `src/gameplay/gameplay-page.tsx`
  - JSDoc: `/** Top-level gameplay page with all providers */`

### Gameplay - Shared Components

- [ ] `src/gameplay/shared/components/action-button/action-button.tsx`
  - JSDoc: `/** Reusable action button with loading and disabled states */`
- [ ] `src/gameplay/shared/components/error-message/error-message.tsx`
  - JSDoc: `/** Error message display component */`
- [ ] `src/gameplay/shared/components/loading-spinner/loading-spinner.tsx`
  - JSDoc: `/** Animated loading spinner */`
- [ ] `src/gameplay/shared/components/status-dot.tsx`
  - JSDoc: `/** Colored status indicator dot */`
- [ ] `src/gameplay/shared/game-instructions/game-instructions.tsx`
  - JSDoc: `/** In-game instructions and help text */`

### Index

- [ ] `src/index.tsx` - SKIP (app entry point)

### Lib

- [ ] `src/lib/websocket/websocket-context.tsx` - SKIP (context provider)

### Lobby Components

- [x] `src/lobby/components/add-player-input.tsx` - DONE
  - JSDoc: `/** Text input with add button for adding players to a team (single-device mode) */`
- [x] `src/lobby/components/join-area.tsx` - DONE
  - JSDoc: `/** Form for new players to enter their name and choose a team to join (multi-device mode) */`
- [x] `src/lobby/components/lobby-header.tsx` - DONE
  - JSDoc: `/** Lobby title bar showing game ID and player count */`
- [x] `src/lobby/components/my-team-box.tsx` - DONE
  - JSDoc: `/** Shows the current player's team assignment with animated team switching (multi-device mode) */`
- [x] `src/lobby/components/player-tile.tsx` - DONE
  - JSDoc: `/** Individual player row - read-only in multi-device, draggable/editable in single-device */`
- [x] `src/lobby/components/start-button.tsx` - DONE
  - JSDoc: `/** Start game button - disabled until minimum player requirements are met */`
- [x] `src/lobby/components/team-tile.tsx` - DONE
  - JSDoc: `/** Team card displaying player list with optional drag-drop support and footer slot */`
- [x] `src/lobby/components/teams-grid.tsx` - DONE
  - JSDoc: `/** Grid layout for team tiles - desktop shows both, mobile shows one at a time */`

### Lobby Main

- [ ] `src/lobby/lobby-page.tsx`
  - JSDoc: `/** Lobby entry point - loads data and routes to single/multi device mode */`
- [ ] `src/lobby/multi-device-lobby.tsx`
  - JSDoc: `/** Multi-device lobby where each player joins from their own device */`
- [ ] `src/lobby/single-device-lobby.tsx`
  - JSDoc: `/** Single-device lobby for local play with drag-drop team management */`
- [ ] `src/lobby/team-symbol.tsx`
  - JSDoc: `/** Team logo/symbol with optional button behavior */`

### Sandbox (Low Priority)

- [ ] `src/sandbox/bouncing-ball-demo.tsx` - SKIP (demo)
- [ ] `src/sandbox/card-visibility-sandbox.tsx` - SKIP (demo)
- [ ] `src/sandbox/dashboard-sandbox.tsx` - SKIP (demo)
- [ ] `src/sandbox/game-over-layouts-sandbox.tsx` - SKIP (demo)
- [ ] `src/sandbox/mock-providers.tsx` - SKIP (test utilities)
- [ ] `src/sandbox/music-visualiser-animation/control-panel.tsx` - SKIP (demo)
- [ ] `src/sandbox/music-visualiser-animation/equalizer-components.tsx` - SKIP (demo)
- [ ] `src/sandbox/music-visualiser-animation/music-visualiser-demo.tsx` - SKIP (demo)
- [ ] `src/sandbox/music-visualiser-animation/visualizer-display.tsx` - SKIP (demo)
- [ ] `src/sandbox/ripple-grid-demo.tsx` - SKIP (demo)
- [ ] `src/sandbox/sandbox-panels.tsx` - SKIP (demo)
- [ ] `src/sandbox/spring-test.tsx` - SKIP (demo)

---

## Progress Summary

- **Total files**: 89
- **To refactor**: ~50
- **Skipped**: ~39 (providers, routes, demos, utilities)
- **Completed**: 8 (lobby components)
