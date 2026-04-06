import { jest, describe, it, expect } from "@jest/globals";
import { makeGuessService } from "@backend/game/gameplay/turns/guess/make-guess.service";
import { buildGameAggregate, buildTurn } from "../../__test-utils__/fixtures";
import { GameplayValidationError } from "@backend/game/gameplay/errors/gameplay.errors";

jest.mock("@backend/shared/websocket", () => ({
  GameEventsEmitter: {
    guessMade: jest.fn(),
    turnEnded: jest.fn(),
    turnStarted: jest.fn(),
  },
}));

describe("makeGuessService", () => {
  const mockLogger = {
    for: () => ({ withMeta: () => ({ create: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }) }) }),
    error: jest.fn(),
  } as any;

  const mockTurnState = jest.fn<(...args: any[]) => any>();

  const createService = (guessOutcome = "CORRECT_TEAM_CARD", handlerThrows: Error | null = null) => {
    const gameState = buildGameAggregate();
    const gameplayHandler = jest.fn<(...args: any[]) => any>().mockImplementation(
      async (_state: any, fn: any) => {
        if (handlerThrows) throw handlerThrows;
        return fn({
          makeGuess: jest.fn<any>().mockResolvedValue({
            outcome: guessOutcome,
            card: { _id: 1, word: "APPLE" },
            guess: { _id: 1, createdAt: new Date() },
            turn: { _id: 1, _teamId: 1, guessesRemaining: 2 },
            state: gameState,
          }),
          endTurn: jest.fn<any>().mockResolvedValue(gameState),
          startTurn: jest.fn<any>().mockResolvedValue({ newTurn: { publicId: "new-turn-uuid" }, state: gameState }),
          endRound: jest.fn<any>().mockResolvedValue(gameState),
          endGame: jest.fn<any>().mockResolvedValue(gameState),
        });
      },
    );

    mockTurnState.mockResolvedValue({
      publicId: "turn-uuid",
      teamName: "Red",
      status: "ACTIVE",
      guessesRemaining: 2,
      createdAt: new Date(),
      completedAt: null,
      clue: { word: "FRUIT", number: 2, createdAt: new Date() },
      hasGuesses: true,
      lastGuess: { cardWord: "APPLE", playerName: "Bob", outcome: guessOutcome, createdAt: new Date() },
      prevGuesses: [],
    });

    return makeGuessService(mockLogger)({
      gameplayHandler,
      getTurnState: mockTurnState,
    });
  };

  it("returns success with guess data on correct team card", async () => {
    const service = createService("CORRECT_TEAM_CARD");
    const gameState = buildGameAggregate();

    const result = await service({ gameState, cardWord: "APPLE" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guess.outcome).toBe("CORRECT_TEAM_CARD");
      expect(result.data.guess.cardWord).toBe("APPLE");
      expect(result.data.turn).toBeDefined();
    }
  });

  it("returns round-not-found when no current round", async () => {
    const service = createService();
    const gameState = buildGameAggregate({ currentRound: null });

    const result = await service({ gameState, cardWord: "APPLE" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.status).toBe("round-not-found");
    }
  });

  it("returns invalid-card when handler throws card validation error", async () => {
    const service = createService("CORRECT_TEAM_CARD", new GameplayValidationError("guess card", [
      { path: "cardWord", message: "Card already selected" },
    ]));

    const gameState = buildGameAggregate();
    const result = await service({ gameState, cardWord: "APPLE" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.status).toBe("invalid-card");
    }
  });

  it("returns invalid-game-state when handler throws game state error", async () => {
    const service = createService("CORRECT_TEAM_CARD", new GameplayValidationError("make guess", [
      { path: "status", message: "Game not in progress" },
    ]));

    const gameState = buildGameAggregate();
    const result = await service({ gameState, cardWord: "APPLE" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.status).toBe("invalid-game-state");
    }
  });

  it("re-throws non-gameplay errors", async () => {
    const service = createService("CORRECT_TEAM_CARD", new Error("Network error"));
    const gameState = buildGameAggregate();

    await expect(service({ gameState, cardWord: "APPLE" })).rejects.toThrow("Network error");
  });
});
