/**
 * Mock Providers for Sandbox
 *
 * Provides mock implementations of all game providers so that
 * real components can be rendered without connecting to the backend.
 *
 * Uses the actual context objects exported from the real providers
 * so that the real hooks work transparently.
 */

import React, { useState, ReactNode, useMemo } from "react";
import { GameData } from "@frontend/shared-types";
import { GAME_TYPE, GAME_FORMAT } from "@codenames/shared/types";

// Import actual contexts from real providers
import {
  GameDataContext,
  TurnContext,
  PlayerContext,
  type GameDataContextValue,
  type TurnContextType,
  type PlayerContextValue,
} from "../gameplay/game-data/providers";
import {
  GameActionsContext,
  type GameActionsContextValue,
  type ActionState,
} from "../gameplay/game-actions";
import { PlayerSceneContext, type PlayerSceneContextValue } from "../gameplay/game-scene";
import { ViewModeContext, type ViewMode, type ViewModeContextValue } from "../gameplay/game-board/view-mode";

// ============================================================================
// SANDBOX CONFIG - Controls mock behavior
// ============================================================================

export interface MockGuess {
  cardWord: string;
  playerName: string;
  outcome: "CORRECT_TEAM_CARD" | "OTHER_TEAM_CARD" | "BYSTANDER_CARD" | "ASSASSIN_CARD";
}

export interface SandboxConfig {
  // Player configuration
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
  teamName: string | undefined;
  playerName: string;

  // Turn state
  activeTeamName: string | undefined;
  hasClue: boolean;
  clueWord: string;
  clueNumber: number;
  guessesRemaining: number;
  guesses: MockGuess[];

  // Round state
  roundStatus: "SETUP" | "IN_PROGRESS" | "COMPLETED" | null;
  hasRound: boolean;
  hasCards: boolean;

  // Scores
  redScore: number;
  blueScore: number;
  winningTeam: string | undefined;

  // Action state
  isActionLoading: boolean;
}

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  role: "CODEMASTER",
  teamName: "Red",
  playerName: "Agent Smith",
  activeTeamName: "Red",
  hasClue: false,
  clueWord: "CYBER",
  clueNumber: 3,
  guessesRemaining: 0,
  guesses: [],
  roundStatus: "IN_PROGRESS",
  hasRound: true,
  hasCards: true,
  redScore: 8,
  blueScore: 5,
  winningTeam: undefined,
  isActionLoading: false,
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const createMockGameData = (config: SandboxConfig): GameData => ({
  publicId: "sandbox-game-123",
  status: config.roundStatus === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
  gameType: GAME_TYPE.SINGLE_DEVICE,
  gameFormat: GAME_FORMAT.QUICK,
  createdAt: new Date(),
  teams: [
    {
      name: "Red",
      score: config.redScore,
      players: [
        { publicId: "player-red-1", name: "Agent Smith", isActive: true },
      ],
    },
    {
      name: "Blue",
      score: config.blueScore,
      players: [
        { publicId: "player-blue-1", name: "Agent Jones", isActive: true },
      ],
    },
  ],
  playerContext:
    config.role === "NONE" || config.role === "SPECTATOR"
      ? null
      : {
          publicId: "player-1",
          playerName: config.playerName,
          teamName: config.teamName || "Red",
          role: config.role,
        },
  currentRound: config.hasRound
    ? {
        roundNumber: 1,
        status: config.roundStatus || "SETUP",
        winningTeamName: config.winningTeam || null,
        cards: config.hasCards
          ? Array.from({ length: 25 }, (_, i) => ({
              word: `WORD${i + 1}`,
              selected: false,
              teamName: i < 9 ? "Red" : i < 17 ? "Blue" : i === 24 ? null : null,
              cardType: i < 9 ? "RED" : i < 17 ? "BLUE" : i === 24 ? "ASSASSIN" : "NEUTRAL",
            }))
          : [],
        turns:
          config.roundStatus === "IN_PROGRESS"
            ? [
                {
                  id: "turn-1",
                  teamName: config.activeTeamName || "Red",
                  status: "ACTIVE",
                  guessesRemaining: config.guessesRemaining,
                  clue: config.hasClue
                    ? { word: config.clueWord, number: config.clueNumber }
                    : undefined,
                  guesses: [],
                },
              ]
            : [],
      }
    : null,
});

const createMockTurnData = (config: SandboxConfig) => {
  // Only create turn data when round is in progress
  if (config.roundStatus !== "IN_PROGRESS") {
    return null;
  }

  const guesses = config.guesses || [];
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
  const prevGuesses = guesses.length > 1 ? guesses.slice(0, -1) : [];

  return {
    id: "turn-1",
    teamName: config.activeTeamName || "Red",
    status: "ACTIVE" as const,
    guessesRemaining: config.guessesRemaining,
    createdAt: new Date(),
    completedAt: null,
    clue: config.hasClue
      ? {
          word: config.clueWord,
          number: config.clueNumber,
          createdAt: new Date(),
        }
      : null,
    hasGuesses: guesses.length > 0,
    lastGuess: lastGuess
      ? {
          cardWord: lastGuess.cardWord,
          playerName: lastGuess.playerName,
          outcome: lastGuess.outcome,
          createdAt: new Date(),
        }
      : null,
    prevGuesses: prevGuesses.map((g) => ({
      cardWord: g.cardWord,
      playerName: g.playerName,
      outcome: g.outcome,
      createdAt: new Date(),
    })),
  };
};

// ============================================================================
// MOCK PROVIDERS COMPONENT
// ============================================================================

interface MockProvidersProps {
  children: ReactNode;
  config: SandboxConfig;
}

export const MockProviders: React.FC<MockProvidersProps> = ({ children, config }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("normal");

  const gameData = useMemo(() => createMockGameData(config), [config]);
  const turnData = useMemo(() => createMockTurnData(config), [config]);

  const gameDataValue: GameDataContextValue = useMemo(
    () => ({
      gameData,
      gameId: "sandbox-game-123",
      isPending: false,
      isError: false,
      error: null,
      refetch: () => console.log("[Sandbox] refetch called"),
      isFetching: false,
    }),
    [gameData]
  );

  const turnValue: TurnContextType = useMemo(
    () => ({
      activeTurn: turnData,
      isLoading: false,
      error: null,
      setLastActionTurnId: (id: string) => console.log("[Sandbox] setLastActionTurnId:", id),
      clearActiveTurn: () => console.log("[Sandbox] clearActiveTurn called"),
    }),
    [turnData]
  );

  const actionsValue: GameActionsContextValue = useMemo(
    () => ({
      actionState: {
        name: null,
        status: config.isActionLoading ? "loading" : "idle",
        error: null,
      } as ActionState,
      resetActionState: () => console.log("[Sandbox] resetActionState called"),
      giveClue: (word: string, count: number) =>
        console.log("[Sandbox] giveClue called:", { word, count }),
      makeGuess: (word: string) => console.log("[Sandbox] makeGuess called:", word),
      createRound: () => console.log("[Sandbox] createRound called"),
      startRound: () => console.log("[Sandbox] startRound called"),
      dealCards: async () => {
        console.log("[Sandbox] dealCards called");
      },
      endTurn: () => console.log("[Sandbox] endTurn called"),
    }),
    [config.isActionLoading]
  );

  const playerValue: PlayerContextValue = useMemo(
    () => ({
      currentPlayerId: "player-1",
      setCurrentPlayerId: (id: string | null) =>
        console.log("[Sandbox] setCurrentPlayerId:", id),
    }),
    []
  );

  const sceneValue: PlayerSceneContextValue = useMemo(
    () => ({
      currentRole: config.role,
      currentScene: config.roundStatus === "SETUP" ? "LOBBY" : "ACTIVE",
      triggerSceneTransition: (event: string) =>
        console.log("[Sandbox] triggerSceneTransition:", event),
    }),
    [config.role, config.roundStatus]
  );

  const viewModeValue: ViewModeContextValue = useMemo(
    () => ({
      viewMode,
      setViewMode,
      toggleSpymasterViewMode: () => setViewMode((v) => (v === "normal" ? "spymaster" : "normal")),
    }),
    [viewMode]
  );

  return (
    <GameDataContext.Provider value={gameDataValue}>
      <TurnContext.Provider value={turnValue}>
        <GameActionsContext.Provider value={actionsValue}>
          <PlayerContext.Provider value={playerValue}>
            <PlayerSceneContext.Provider value={sceneValue}>
              <ViewModeContext.Provider value={viewModeValue}>
                {children}
              </ViewModeContext.Provider>
            </PlayerSceneContext.Provider>
          </PlayerContext.Provider>
        </GameActionsContext.Provider>
      </TurnContext.Provider>
    </GameDataContext.Provider>
  );
};
