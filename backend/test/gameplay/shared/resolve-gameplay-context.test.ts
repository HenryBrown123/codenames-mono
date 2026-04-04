import { jest, describe, it, expect } from "@jest/globals";
import { createResolveGameplayContext } from "@backend/gameplay/shared/resolve-gameplay-context";
import { buildGameAggregate, buildTurn, buildPlayer } from "../../__test-utils__/fixtures";
import type { GameAggregate } from "@backend/common/state/gameplay-state.types";

describe("resolveGameplayContext.fromRole", () => {
  const makeResolver = (gameState: GameAggregate | null = null) => {
    const loadGameData = jest.fn<any>().mockResolvedValue(gameState);
    const getGameState = jest.fn<any>();
    const resolver = createResolveGameplayContext({ getGameState, loadGameData });
    return { resolver, loadGameData, getGameState };
  };

  it("resolves CODEMASTER on active turn's team", async () => {
    const game = buildGameAggregate();
    const userId = game.teams[0].players[0]._userId; // Red CM's userId
    const { resolver } = makeResolver(game);

    const result = await resolver.fromRole("game-public-id", userId, "CODEMASTER");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.gameState.playerContext).not.toBeNull();
      expect(result.gameState.playerContext!.role).toBe("CODEMASTER");
      expect(result.gameState.playerContext!.teamName).toBe("Red");
    }
  });

  it("resolves CODEBREAKER on active turn's team", async () => {
    const game = buildGameAggregate();
    const userId = game.teams[0].players[1]._userId; // Red CB's userId
    const { resolver } = makeResolver(game);

    const result = await resolver.fromRole("game-public-id", userId, "CODEBREAKER");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.gameState.playerContext!.role).toBe("CODEBREAKER");
    }
  });

  it("returns game-not-found when game doesn't exist", async () => {
    const { resolver } = makeResolver(null);

    const result = await resolver.fromRole("bad-id", 1, "CODEMASTER");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("game-not-found");
    }
  });

  it("returns user-not-in-game when userId doesn't match any player", async () => {
    const game = buildGameAggregate();
    const { resolver } = makeResolver(game);

    const result = await resolver.fromRole("game-public-id", 99999, "CODEMASTER");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("user-not-in-game");
    }
  });

  it("returns no-active-turn when no turn is active", async () => {
    const game = buildGameAggregate();
    // Set all turns to COMPLETED
    game.currentRound!.turns = [
      buildTurn({ status: "COMPLETED", _teamId: 1, teamName: "Red" }),
    ];
    const userId = game.teams[0].players[0]._userId;
    const { resolver } = makeResolver(game);

    const result = await resolver.fromRole("game-public-id", userId, "CODEMASTER");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("no-active-turn");
    }
  });

  it("returns no-player-for-role when role doesn't exist on team", async () => {
    const game = buildGameAggregate();
    // Remove all codemasters from Red team in round players
    game.currentRound!.players = game.currentRound!.players.filter(
      (p) => !(p._teamId === 1 && p.role === "CODEMASTER"),
    );
    const userId = game.teams[0].players[1]._userId; // Red CB's userId
    const { resolver } = makeResolver(game);

    const result = await resolver.fromRole("game-public-id", userId, "CODEMASTER");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("no-player-for-role");
    }
  });
});
