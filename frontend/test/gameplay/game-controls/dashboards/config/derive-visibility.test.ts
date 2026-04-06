import { describe, it, expect } from "vitest";
import { deriveVisibilityContext, type VisibilityInputs } from "@frontend/game/gameplay/dashboard/config/derive-visibility";
import type { GameData, TurnData } from "@frontend/shared/types";

/** Minimal GameData factory */
const buildGameData = (overrides: Partial<GameData> = {}): GameData => ({
  publicId: "game-1",
  status: "IN_PROGRESS",
  gameType: "SINGLE_DEVICE",
  gameFormat: "QUICK",
  createdAt: new Date(),
  teams: [],
  currentRound: {
    roundNumber: 1,
    status: "IN_PROGRESS",
    winningTeamName: null,
    cards: [{ word: "APPLE", selected: false, teamName: "Red", cardType: "TEAM" }],
    turns: [],
  },
  playerContext: {
    publicId: "player-1",
    playerName: "Alice",
    teamName: "Red",
    role: "CODEMASTER",
  },
  ...overrides,
});

/** Minimal TurnData factory */
const buildTurnData = (overrides: Partial<TurnData> = {}): TurnData => ({
  id: "turn-1",
  teamName: "Red",
  status: "ACTIVE",
  guessesRemaining: 3,
  createdAt: new Date(),
  completedAt: null,
  clue: null,
  hasGuesses: false,
  lastGuess: null,
  prevGuesses: [],
  active: null,
  ...overrides,
});

const defaultInputs = (): VisibilityInputs => ({
  gameData: buildGameData(),
  activeTurn: buildTurnData(),
  historicTurns: [],
  actionStatus: "idle",
  aiStatus: null,
  isAiClaimed: false,
});

describe("deriveVisibilityContext", () => {
  it("derives role from playerContext", () => {
    const ctx = deriveVisibilityContext(defaultInputs());
    expect(ctx.role).toBe("CODEMASTER");
  });

  it("defaults role to NONE when no playerContext", () => {
    const inputs = defaultInputs();
    inputs.gameData = buildGameData({ playerContext: null });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.role).toBe("NONE");
  });

  it("isActiveTeam true when team matches active turn", () => {
    const inputs = defaultInputs();
    inputs.activeTurn = buildTurnData({ teamName: "Red" });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.isActiveTeam).toBe(true);
  });

  it("isActiveTeam false when teams differ", () => {
    const inputs = defaultInputs();
    inputs.activeTurn = buildTurnData({ teamName: "Blue" });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.isActiveTeam).toBe(false);
  });

  it("hasClue true when turn has clue", () => {
    const inputs = defaultInputs();
    inputs.activeTurn = buildTurnData({
      clue: { word: "FRUIT", number: 2 },
    });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.hasClue).toBe(true);
  });

  it("hasClue false when turn has no clue", () => {
    const inputs = defaultInputs();
    inputs.activeTurn = buildTurnData({ clue: null });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.hasClue).toBe(false);
  });

  it("isAiSession true from active.isAi", () => {
    const inputs = defaultInputs();
    inputs.activeTurn = buildTurnData({
      active: { teamName: "Red", role: "CODEMASTER", isAi: true, playerName: null },
    });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.isAiSession).toBe(true);
  });

  it("isAiSession true from isAiClaimed even when active is null", () => {
    const inputs = defaultInputs();
    inputs.isAiClaimed = true;
    inputs.activeTurn = buildTurnData({ active: null });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.isAiSession).toBe(true);
  });

  it("isAiSession false when both signals are false", () => {
    const inputs = defaultInputs();
    inputs.isAiClaimed = false;
    inputs.activeTurn = buildTurnData({
      active: { teamName: "Red", role: "CODEMASTER", isAi: false, playerName: "Alice" },
    });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.isAiSession).toBe(false);
  });

  it("lastCompletedTurn picks last COMPLETED turn from history", () => {
    const inputs = defaultInputs();
    inputs.historicTurns = [
      buildTurnData({ id: "t1", status: "COMPLETED" }),
      buildTurnData({ id: "t2", status: "COMPLETED" }),
    ];
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.lastCompletedTurn?.id).toBe("t2");
  });

  it("lastCompletedTurn null when no completed turns", () => {
    const inputs = defaultInputs();
    inputs.historicTurns = [];
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.lastCompletedTurn).toBeNull();
  });

  it("hasCards based on cards array", () => {
    const inputs = defaultInputs();
    expect(deriveVisibilityContext(inputs).hasCards).toBe(true);

    inputs.gameData = buildGameData({
      currentRound: {
        roundNumber: 1,
        status: "IN_PROGRESS",
        winningTeamName: null,
        cards: [],
        turns: [],
      },
    });
    expect(deriveVisibilityContext(inputs).hasCards).toBe(false);
  });

  it("isActionLoading reflects action status", () => {
    const inputs = defaultInputs();
    inputs.actionStatus = "loading";
    expect(deriveVisibilityContext(inputs).isActionLoading).toBe(true);

    inputs.actionStatus = "idle";
    expect(deriveVisibilityContext(inputs).isActionLoading).toBe(false);
  });

  it("falls back to gameData active phase when activeTurn.active is null", () => {
    const inputs = defaultInputs();
    const activePhase = { teamName: "Red", role: "CODEMASTER" as const, isAi: false, playerName: "Alice" };
    inputs.gameData = buildGameData({
      currentRound: {
        roundNumber: 1,
        status: "IN_PROGRESS",
        winningTeamName: null,
        cards: [],
        turns: [
          {
            id: "turn-1",
            teamName: "Red",
            status: "ACTIVE",
            guessesRemaining: 3,
            guesses: [],
            active: activePhase,
          },
        ],
      },
    });
    inputs.activeTurn = buildTurnData({ active: null });
    const ctx = deriveVisibilityContext(inputs);
    expect(ctx.active).toEqual(activePhase);
  });
});
