# Codenames

Full-stack TypeScript implementation of the Codenames board game with real-time multiplayer support.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend](#backend)
  - [API Design](#api-design)
  - [Database Layer](#database-layer)
  - [Transaction Management](#transaction-management)
  - [Authentication](#authentication)
  - [Dependency Injection](#dependency-injection)
- [Frontend](#frontend)
  - [State Management](#state-management)
  - [UI Architecture](#ui-architecture)
- [Shared Package](#shared-package)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)

## Overview

This project implements Codenames as a multiplayer web application using TypeScript throughout the stack. The architecture emphasizes type safety, functional programming patterns, and clean separation of concerns.

## Architecture

The project uses a monorepo structure managed with npm workspaces:

```
backend    - Node.js/Express API server
frontend   - React single-page application  
shared     - Shared types, constants, and OpenAPI specification
```

The monorepo approach enables seamless type sharing between packages and simplifies the build process. TypeScript types are imported directly across packages without requiring separate publishing or linking steps.

## Backend

The backend follows functional programming principles with minimal use of classes (limited to error types and library requirements). The architecture implements vertical slicing for features while maintaining shared repositories for data access.

### API Design

The API implements RESTful patterns where appropriate, with action-based endpoints for operations that don't map to standard CRUD operations.

Example endpoints:
```
# Authentication
POST   /api/auth/guests

# Game Setup
POST   /api/games
GET    /api/games/:gameId

# Lobby Management
POST   /api/games/:gameId/players
PATCH  /api/games/:gameId/players
PATCH  /api/games/:gameId/players/:playerId
DELETE /api/games/:gameId/players/:playerId
POST   /api/games/:gameId/start

# Gameplay
POST   /api/games/:gameId/rounds
POST   /api/games/:gameId/rounds/:id/deal
POST   /api/games/:gameId/rounds/:roundNumber/start
POST   /api/games/:gameId/rounds/:roundNumber/clues
POST   /api/games/:gameId/rounds/:roundNumber/guesses
GET    /api/turns/:turnId
```

### Database Layer

The application uses PostgreSQL with Kysely as the query builder. Repository functions provide the data access layer, organized by entity and imported as namespace objects within feature composition roots:

```typescript
import * as gameRepository from './repositories/game-repository'
import * as playerRepository from './repositories/player-repository'
```

This pattern maintains clean separation between data access and business logic while encouraging code reuse across features.

### Transaction Management

Game actions require atomic operations to maintain consistency. The transaction management system uses a transactional handler pattern with dedicated operations:

```typescript
const handler = createTransactionalHandler(db, (trx) => ({
  createRound: newRoundActions.createNextRound(
    roundsRepository.createNewRound(trx)
  ),
  dealCards: dealCardsActions.dealCardsToRound(
    cardsRepository.getRandomWords(trx),
    cardsRepository.replaceCards(trx)
  ),
  makeGuess: makeGuessActions.createMakeGuessAction({
    updateCards: cardsRepository.updateCards(trx),
    createGuess: turnRepository.createGuess(trx),
    updateTurnGuesses: turnRepository.updateTurnGuesses(trx),
    validateMakeGuess: makeGuessRules.validateMakeGuess
  })
}));
```

Actions only accept branded types that are output from validation functions. Here's how the make-guess service implements this pattern:

```typescript
// Service orchestrates the action within a transaction
export const makeGuessService = 
  (gameplayHandler: TransactionalHandler<GameplayOperations>) =>
  async (input: MakeGuessInput): Promise<MakeGuessResult> => {
    return await gameplayHandler(async (actions) => {
      // Get current game state
      const gameState = await actions.getCurrentGameState(
        input.gameId,
        input.userId
      );

      // Perform the guess action - this internally validates
      // and only accepts ValidatedGameState branded type
      const result = await actions.makeGuess(
        gameState,
        input.cardWord
      );

      // Handle outcome-based transitions
      if (result.outcome === CODEBREAKER_OUTCOME.ASSASSIN_CARD) {
        await actions.endRound(gameState, currentRound._id, opposingTeamId);
        await actions.endGame(gameState, opposingTeamId);
      }

      return { success: true, data: result };
    });
  };

// The action implementation enforces validation
export const createMakeGuessAction = (deps: {
  updateCards: CardUpdater;
  createGuess: GuessCreator;
  updateTurnGuesses: TurnGuessesUpdater;
  validateMakeGuess: (data: GameAggregate) => GameplayValidationResult<MakeGuessValidGameState>;
}) => {
  return async (
    gameState: GameAggregate,  // Raw game state input
    cardWord: string
  ): Promise<MakeGuessActionResult> => {
    // Validation produces branded type or throws
    const validation = deps.validateMakeGuess(gameState);
    if (!validation.valid) {
      throw new GameplayValidationError("make guess", validation.errors);
    }

    // validation.data is now MakeGuessValidGameState branded type
    // All subsequent operations can trust the validated state
    const validatedState = validation.data;
    
    // ... perform guess logic with validated state
  };
};
```

Branded types ensure compile-time safety - you cannot pass unvalidated game state to actions:

```typescript
// Branded type definition
export type ValidatedGameState<T extends ZodSchema> = z.infer<T> & {
  readonly __brand: unique symbol;
};

// Only validation functions can produce branded types
export type MakeGuessValidGameState = ValidatedGameState<typeof makeGuessActionSchema>;
```

### Authentication

JWT-based guest authentication prevents session hijacking across devices. Each guest receives an auto-generated username to improve the multiplayer experience. The system prioritizes quick game entry while maintaining session security.

### Dependency Injection

External dependencies are injected using factory functions and currying, applied at the composition level. This approach prevents infrastructure concerns from leaking into business logic:

```typescript
const createGameService = (db: Database) => ({
  createGame: createGame(db),
  joinGame: joinGame(db),
  // Services receive pre-configured dependencies
})
```

## Frontend

The frontend implements a functional React architecture with minimal external dependencies.

### State Management

@tanstack/react-query manages all server state synchronization and mutations. The architecture uses multiple focused providers with clear dependency hierarchy:

```typescript
<PlayerContextProvider>
  <GameDataProvider gameId={gameId}>
    <ActiveGameProviders>
      <TurnDataProvider>
        <DeviceModeManager gameData={gameData}>
          <GameActionsProvider>{children}</GameActionsProvider>
        </DeviceModeManager>
      </TurnDataProvider>
    </ActiveGameProviders>
  </GameDataProvider>
</PlayerContextProvider>
```

@tanstack/react-query handles:
- Automatic background refetching
- Request deduplication
- Optimistic updates for game actions
- Error and loading states

Example usage:
```typescript
const { gameData, isLoading, error } = useGameData();
const { mutate: giveClue, isPending } = useGiveClueMutation();
```

### UI Architecture

The GameScene component orchestrates gameplay UI based on role-specific state machines managed by the PlayerSceneProvider. These state machines handle complex UI transitions for different player perspectives:

```typescript
const determineCorrectRole = (gameData: GameData): PlayerRole => {
  if (gameData.status !== "IN_PROGRESS") return PLAYER_ROLE.NONE;
  if (!gameData.currentRound) return PLAYER_ROLE.NONE;
  if (gameData.currentRound.status === "SETUP") return PLAYER_ROLE.NONE;
  
  return gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
};
```

Role-based state machines define UI flows for each player type:

```typescript
interface StateTransition {
  condition?: string | string[];
  type: "scene" | "END";
  target?: string;
}

interface SceneConfig {
  on?: Record<string, StateTransition | StateTransition[]>;
}

// Codebreaker state machine - handles guessing flow
export const createCodebreakerStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        GUESS_MADE: [
          {
            condition: ["roundCompleted"],
            type: "END",  // Transition to next role
          },
          {
            condition: ["codebreakerTurnEnded"],
            type: "scene",
            target: "outcome",
          },
          {
            type: "scene",
            target: "main",  // Continue guessing
          },
        ],
      },
    },
    outcome: {
      on: {
        OUTCOME_ACKNOWLEDGED: {
          type: "END",  // Move to next player's turn
        },
      },
    },
  },
});

// Factory function to get state machine for role
export const getStateMachine = (role: string): StateMachine => {
  switch (role.toUpperCase()) {
    case PLAYER_ROLE.CODEBREAKER:
      return createCodebreakerStateMachine();
    case PLAYER_ROLE.CODEMASTER:
      return createCodemasterStateMachine();
    case PLAYER_ROLE.SPECTATOR:
      return createSpectatorStateMachine();
    case PLAYER_ROLE.NONE:
    default:
      return createNoneStateMachine();
  }
};
```

The GameScene component composes different boards, dashboards, and message panels based on the current player's state machine scene. This modular approach supports different player perspectives without conditional rendering complexity.

## Device Handoff System

The game supports both multi-device and single-device modes. In single-device mode, multiple players share one device, requiring a **device handoff system** to manage transitions between players while maintaining game security and state consistency.

### What is Device Handoff?

Device handoff solves the challenge of pass-and-play gaming where:
- Multiple players take turns on the same device
- Each player should only see information appropriate to their role
- The game must smoothly transition between player perspectives
- Turn completion must trigger handoff to the next player

### Implementation Architecture

The `DeviceModeManager` orchestrates device handoff through several key mechanisms:

```typescript
export const DeviceModeManager: React.FC<DeviceModeManagerProps> = ({ 
  children, 
  gameData 
}) => {
  const { currentPlayerId, setCurrentPlayerId } = usePlayerContext();
  const { clearActiveTurn } = useTurn();

  // Determines when handoff UI should be shown
  const requiresHandoff =
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE &&
    !currentPlayerId;

  return (
    <>
      <PlayerSceneProvider 
        key={gameData.playerContext?.role} 
        onTurnComplete={handleTurnComplete}
      >
        {children}
      </PlayerSceneProvider>
      {requiresHandoff && (
        <DeviceHandoffOverlay 
          gameData={gameData} 
          onContinue={handleHandoffComplete} 
        />
      )}
    </>
  );
};
```

### Handoff Flow

1. **Turn Completion**: When a player completes their turn, `onTurnComplete` is triggered
2. **Context Clearing**: The current player ID is cleared, removing role-specific access
3. **Neutral State**: Game enters a neutral state where no player-specific information is visible
4. **Handoff Detection**: `requiresHandoff` becomes true when no player is active
5. **Overlay Display**: `DeviceHandoffOverlay` shows transition UI
6. **Player Selection**: Next player selects themselves from available players
7. **Context Restoration**: New player ID is set, restoring appropriate role perspective

### Security Considerations

- **Information Hiding**: When no player is active, only neutral game state is visible
- **Role Isolation**: Each player only sees information appropriate to their role
- **Turn Validation**: Server validates that actions come from the correct player
- **State Transitions**: Clean transitions prevent information leakage between players

### User Experience

The handoff overlay provides:
- Clear indication that device should change hands
- Visual list of available players
- Role-based icons and team colors
- Smooth animations between player perspectives
- Quick player selection to minimize game interruption

This system enables seamless local multiplayer while maintaining the strategic secrecy essential to Codenames gameplay.

The architecture avoids `useEffect` for data synchronization, relying on @tanstack/react-query for all server state management. Effects are limited to complex form validation and debug logging.

# Animation Architecture

## Overview

The Codenames game uses a **visibility-based animation system** that tracks the visual presentation state of cards separately from the game data state. This approach ensures animations play at the right time, in the right place, without complex orchestration logic.

## Core Concept

Instead of imperatively triggering animations, the system **derives** animation needs by comparing:
- **Server State**: What the game data says (e.g., "this card is selected")
- **Visual State**: What has been shown to the user (e.g., "this card has been covered")

When these states don't match, an animation plays to transition the visual state.

## Key Components

### `CardVisibilityProvider` and `useCardVisibility` Hook

The heart of the animation system. The provider manages centralized state while individual cards use the hook to determine their animations:

```typescript
// Provider manages all card states centrally
<CardVisibilityProvider cards={cards} initialState="visible">
  {/* Cards rendered here */}
</CardVisibilityProvider>

// Hook determines individual card animations
const visibility = useCardVisibility(card, index, initialVisibility);
```

**Provider Manages:**
- Central visibility state for all cards
- State transitions between `hidden`, `visible`, `visible-colored`, and `covered`

**Hook Provides:**
- `state`: Current visual state of the card
- `animation`: Current animation type (`dealing`, `covering`, `color-fade`, etc.)
- `completeTransition()`: Callback to complete animation state

### Animation Flow

1. **Board renders** with current game data
2. **For each card**, the board asks: "What animation is needed?"
   - Not dealt yet? → `'dealing'` animation
   - Selected but not covered? → `'covering'` animation
   - Otherwise → No animation
3. **Card plays animation** via CSS `data-animation` attribute
4. **On completion**, card notifies board → visual state updated
5. **Next render**, no animation needed (states match)

## Scene-Based Animation Control

Different scenes have different animation requirements:

### Lobby Scene
- `showOnMount: true` when cards are dealt
- All cards animate in with dealing animation

### Codebreaker Main Scene
- `showOnMount: false` - cards already visible
- No cover animations here - just immediate selection

### Codebreaker Outcome Scene
- Fresh board instance with new visibility tracking
- Selected card animates to covered state
- Previously selected cards remain covered without animation

### Spectator/Waiting Scenes
- `showOnMount: false` - passive viewing
- Shows current state without animations

## Implementation Example

```typescript
// In a board component
<CardVisibilityProvider cards={cards} initialState="visible">
  {cards.map((card, index) => {
    const visibility = useCardVisibility(card, index, "visible");
    
    return (
      <GameCard
        key={card.word}
        card={card}
        index={index}
        initialVisibility="visible"
        // GameCard internally uses visibility.state and visibility.animation
      />
    );
  })}
</CardVisibilityProvider>
```

## Benefits

1. **Declarative**: Animations are derived from state, not triggered imperatively
2. **Scene Independent**: Each board instance manages its own visibility
3. **Predictable**: Clear relationship between data and visual state
4. **React-Friendly**: Works with React's re-render cycle, not against it
5. **Simple**: No complex state machines or timing logic

## Animation Types

### Dealing Animation
- **When**: Card exists in data but hasn't been shown yet
- **Visual**: Cards fall from top with rotation, cascade timing based on position
- **Duration**: 0.8s with 50ms stagger between cards

### Covering Animation
- **When**: Card is selected in data but hasn't been visually covered
- **Visual**: Card flips to reveal team color on back
- **Duration**: 0.6s ease-in-out

## Re-deal Functionality

The re-deal button in the lobby works by:
1. Calling `dealCards(true)` which fetches new cards
2. Board re-renders with fresh `useCardVisibility` instance
3. New instance = empty visual state = all cards animate in

No special reset logic needed - it just works!

## Shared Package

The shared package contains:
- OpenAPI specification defining the API contract
- Common domain types and constants
- Type unions and enums used across packages

Domain types are defined centrally:
```typescript
// Type constant
export const GAME_STATE = {
  LOBBY: "LOBBY",
  IN_PROGRESS: "IN_PROGRESS", 
  COMPLETED: "COMPLETED"
} as const;

// Type definition from constant
export type GameState = typeof GAME_STATE[keyof typeof GAME_STATE];

// Enum-like constants with type safety
export const PLAYER_ROLE = {
  CODEMASTER: "CODEMASTER",
  CODEBREAKER: "CODEBREAKER",
  SPECTATOR: "SPECTATOR",
  NONE: "NONE"
} as const;

export type PlayerRole = typeof PLAYER_ROLE[keyof typeof PLAYER_ROLE];

// Used throughout the application
const isActivePlayer = (role: PlayerRole): boolean => {
  return role === PLAYER_ROLE.CODEMASTER || role === PLAYER_ROLE.CODEBREAKER;
};
```

Frontend and backend extend these base types with their specific requirements.

## Technology Stack

### Backend
- **Node.js + Express**: HTTP server and routing
- **PostgreSQL**: Primary database with JSONB for game state storage
- **Kysely**: Type-safe SQL query builder
- **Zod**: Runtime validation for API boundaries and game actions
- **JSON Web Tokens**: Stateless authentication

### Frontend
- **React**: UI library (functional components)
- **TypeScript**: Static typing with strict mode
- **@tanstack/react-query**: Server state management
- **Styled Components**: Component-scoped styling
- **React Router**: Client-side routing

### Development Tools
- **npm workspaces**: Monorepo management
- **TypeScript**: Cross-package type sharing
- **OpenAPI**: API documentation and contract

## Project Structure

```
.
├── backend
│   └── src
│       ├── auth
│       │   ├── create-guest-session
│       │   └── errors
│       ├── common
│       │   ├── config
│       │   ├── data
│       │   │   ├── decks
│       │   │   └── enums
│       │   ├── data-access
│       │   │   └── repositories
│       │   ├── db
│       │   ├── http-middleware
│       │   └── logging
│       ├── gameplay
│       │   ├── errors
│       │   ├── get-game
│       │   ├── get-players
│       │   ├── get-turn
│       │   ├── give-clue
│       │   ├── make-guess
│       │   └── state
│       ├── lobby
│       │   ├── add-players
│       │   ├── assign-roles
│       │   ├── deal-cards
│       │   ├── errors
│       │   ├── modify-players
│       │   ├── new-round
│       │   ├── remove-players
│       │   ├── start-game
│       │   ├── start-round
│       │   └── state
│       └── setup
│           ├── create-new-game
│           └── errors
├── frontend
│   ├── public
│   └── src
│       ├── app
│       │   └── routes
│       │       └── page-layout
│       ├── game-access
│       │   ├── api
│       │   │   ├── endpoints
│       │   │   └── query-hooks
│       │   └── pages
│       ├── gameplay
│       │   ├── device-mode
│       │   ├── player-actions
│       │   │   └── api
│       │   ├── player-scenes
│       │   ├── round-management
│       │   │   └── api
│       │   ├── shared
│       │   │   ├── api
│       │   │   ├── components
│       │   │   │   ├── action-button
│       │   │   │   ├── error-message
│       │   │   │   └── loading-spinner
│       │   │   └── providers
│       │   ├── state
│       │   └── ui-components
│       │       ├── board-controls
│       │       ├── boards
│       │       ├── cards
│       │       │   └── styles
│       │       ├── dashboards
│       │       ├── desktop-sidebar
│       │       └── game-instructions
│       ├── lib
│       ├── lobby
│       │   └── api
│       │       ├── mutations
│       │       └── queries
│       ├── shared-types
│       └── style
└── shared
    └── src
        ├── api
        │   └── modules
        └── types

84 directories
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 8+

### Installation

```bash
# Clone repository  
git clone <your-repo-url>
cd codenames-mono

# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d

# Setup database (optional - tables created automatically)
npm run db:setup -w backend

# Start development servers
npm run dev:all
```

### Development

The development environment runs:
- Backend API on http://localhost:3000
- Frontend dev server on http://localhost:8000
- PostgreSQL on localhost:5432

The frontend development server proxies API requests to the backend.