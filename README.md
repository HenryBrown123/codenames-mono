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
GET    /api/games/:gameId
POST   /api/games
POST   /api/games/:gameId/players
POST   /api/games/:gameId/start
POST   /api/games/:gameId/rounds/:roundNumber/clues
POST   /api/games/:gameId/rounds/:roundNumber/guesses
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

React Query manages all server state synchronization and mutations. The architecture uses multiple focused providers:

```typescript
<GameDataProvider gameId={gameId}>
  <TurnProvider>
    <PlayerRoleSceneProvider>
      <GameActionsProvider>{children}</GameActionsProvider>
    </PlayerRoleSceneProvider>
  </TurnProvider>
</GameDataProvider>
```

React Query handles:
- Automatic background refetching
- Request deduplication
- Optimistic updates for game actions
- Error and loading states

Example usage:
```typescript
const { gameData, isLoading, error } = useGameData();
const { mutate: giveClue, isPending } = useGiveClue();
```

### UI Architecture

The Scene component orchestrates gameplay UI based on role-specific state machines. These state machines handle complex UI transitions for different player perspectives:

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

Device handoff is managed seamlessly for single-device games, showing transition overlays when switching between players.

The architecture avoids `useEffect` for data synchronization, relying on React Query for all server state management. Effects are limited to complex form validation and debug logging.

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
- **React Query**: Server state management
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
│   ├── src
│   │   ├── auth
│   │   │   ├── create-guest-session
│   │   │   └── errors
│   │   ├── common
│   │   │   ├── config
│   │   │   ├── data
│   │   │   │   ├── decks
│   │   │   │   └── enums
│   │   │   ├── data-access
│   │   │   │   └── repositories
│   │   │   ├── db
│   │   │   ├── http-middleware
│   │   │   └── logging
│   │   ├── gameplay
│   │   │   ├── assign-roles
│   │   │   ├── deal-cards
│   │   │   ├── errors
│   │   │   ├── get-game
│   │   │   ├── get-turn
│   │   │   ├── give-clue
│   │   │   ├── guess
│   │   │   ├── new-round
│   │   │   ├── start-round
│   │   │   └── state
│   │   ├── lobby
│   │   │   ├── add-players
│   │   │   ├── errors
│   │   │   ├── modify-players
│   │   │   ├── remove-players
│   │   │   ├── start-game
│   │   │   └── state
│   │   └── setup
│   │       ├── create-new-game
│   │       └── errors
│   └── test
│       └── manual
├── frontend
│   ├── cypress
│   │   ├── component
│   │   └── support
│   ├── public
│   ├── src
│   │   ├── app
│   │   │   └── routes
│   │   │       └── page-layout
│   │   ├── game-access
│   │   │   ├── api
│   │   │   │   ├── endpoints
│   │   │   │   └── query-hooks
│   │   │   └── pages
│   │   ├── gameplay
│   │   │   ├── api
│   │   │   │   ├── mutations
│   │   │   │   └── queries
│   │   │   ├── dashboard
│   │   │   ├── device-handoff
│   │   │   ├── game-actions
│   │   │   ├── game-board
│   │   │   ├── game-data
│   │   │   ├── game-instructions
│   │   │   ├── pages
│   │   │   ├── role-scenes
│   │   │   ├── shared
│   │   │   │   ├── action-button
│   │   │   │   ├── error-message
│   │   │   │   └── loading-spinner
│   │   │   ├── state
│   │   │   └── turn-management
│   │   ├── lib
│   │   ├── lobby
│   │   │   └── api
│   │   ├── shared-types
│   │   └── style
│   └── test
│       └── features
│           └── gameplay
│               └── components
│                   └── game-board
├── scripts
└── shared
    └── src
        ├── api
        │   └── modules
        └── types

87 directories
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 8+

### Installation

```bash
# Clone repository
git clone https://github.com/username/codenames.git
cd codenames

# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d

# Run database migrations
npm run migrate -w backend

# Start development servers
npm run dev:all
```

### Development

The development environment runs:
- Backend API on http://localhost:3001
- Frontend dev server on http://localhost:3000
- PostgreSQL on localhost:5432

The frontend development server proxies API requests to the backend.