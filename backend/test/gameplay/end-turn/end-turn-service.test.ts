import { jest, describe, it, expect } from "@jest/globals";
import { createEndTurnService } from "@backend/game/gameplay/turns/end-turn.service";
import { buildGameAggregate, buildTurn } from "../../__test-utils__/fixtures";

jest.mock("@backend/shared/websocket", () => ({
  GameEventsEmitter: {
    turnEnded: jest.fn(),
    turnStarted: jest.fn(),
  },
}));

describe("endTurnService", () => {
  const mockLogger = {
    for: () => ({ withMeta: () => ({ create: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }) }) }),
    error: jest.fn(),
  } as any;

  const createService = () => {
    const gameplayHandler = jest.fn<(...args: any[]) => any>().mockImplementation(
      async (_state: any, fn: any) => {
        const gameState = buildGameAggregate();
        return fn({
          endTurn: jest.fn<any>().mockResolvedValue(gameState),
          startTurn: jest.fn<any>().mockResolvedValue({ newTurn: { publicId: "new-turn-uuid" }, state: gameState }),
        });
      },
    );

    return createEndTurnService(mockLogger)({ gameplayHandler });
  };

  it("returns success when codebreaker ends turn", async () => {
    const gameState = buildGameAggregate();
    // Set playerContext to codebreaker
    gameState.playerContext = {
      ...gameState.playerContext!,
      role: "CODEBREAKER",
    };
    // Ensure turn has a clue (codebreaker phase)
    gameState.currentRound!.turns[0].clue = { _id: 1, _turnId: 1, word: "FRUIT", number: 2, createdAt: new Date() };

    const service = createService();
    const result = await service({ gameState });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turn.status).toBe("COMPLETED");
    }
  });

  it("rejects when player is not codebreaker", async () => {
    const gameState = buildGameAggregate(); // Default is CODEMASTER

    const service = createService();
    const result = await service({ gameState });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Only codebreakers can end turn");
  });

  it("rejects when no active round", async () => {
    const gameState = buildGameAggregate({ currentRound: null });
    gameState.playerContext = { ...gameState.playerContext!, role: "CODEBREAKER" };

    const service = createService();
    const result = await service({ gameState });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("No active round");
  });

  it("rejects when turn already completed", async () => {
    const gameState = buildGameAggregate();
    gameState.playerContext = { ...gameState.playerContext!, role: "CODEBREAKER" };
    gameState.currentRound!.turns = [buildTurn({ status: "COMPLETED" })];

    const service = createService();
    const result = await service({ gameState });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Turn already completed");
  });

  it("rejects when no player context", async () => {
    const gameState = buildGameAggregate({ playerContext: null });

    const service = createService();
    const result = await service({ gameState });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Player not found");
  });
});
