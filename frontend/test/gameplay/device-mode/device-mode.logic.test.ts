import { describe, it, expect } from "vitest";
import { needsHandoff } from "@frontend/game/gameplay/single-device/device-mode.logic";
import type { TurnPhase } from "@frontend/shared/types";
import type { ClaimedPhase } from "@frontend/game/gameplay/providers/active-game-session-provider";

/** Helpers */

const humanPhase = (role: TurnPhase["role"], teamName: string): TurnPhase => ({
  role,
  teamName,
  isAi: false,
  playerName: "Alice",
});

const aiPhase = (role: TurnPhase["role"], teamName: string): TurnPhase => ({
  role,
  teamName,
  isAi: true,
  playerName: null,
});

const claimed = (role: ClaimedPhase["role"], teamName: string): ClaimedPhase => ({
  role,
  teamName,
});

/** Multi-device -- always false */

describe("needsHandoff — multi-device", () => {
  it("false regardless of active turn", () => {
    expect(needsHandoff(humanPhase("CODEMASTER", "Red"), null, true)).toBe(false);
    expect(needsHandoff(aiPhase("CODEMASTER", "Blue"), claimed("CODEMASTER", "Red"), true)).toBe(
      false,
    );
  });

  it("false when active is null", () => {
    expect(needsHandoff(null, null, true)).toBe(false);
  });
});

/** No active turn (single-device) */

describe("needsHandoff — no active turn", () => {
  it("false when active is null, claimed or not", () => {
    expect(needsHandoff(null, claimed("CODEMASTER", "Red"), false)).toBe(false);
    expect(needsHandoff(null, null, false)).toBe(false);
  });
});

/** Human turns (single-device) */

describe("needsHandoff — human turns", () => {
  it("false when role AND team match what is claimed", () => {
    expect(needsHandoff(humanPhase("CODEMASTER", "Red"), claimed("CODEMASTER", "Red"), false)).toBe(
      false,
    );
    expect(
      needsHandoff(humanPhase("CODEBREAKER", "Blue"), claimed("CODEBREAKER", "Blue"), false),
    ).toBe(false);
  });

  it("true when role changes (same team)", () => {
    expect(
      needsHandoff(humanPhase("CODEBREAKER", "Red"), claimed("CODEMASTER", "Red"), false),
    ).toBe(true);
  });

  it("true when team changes (same role)", () => {
    /** CODEMASTER for the other team -- must hand off even though role is the same */
    expect(
      needsHandoff(humanPhase("CODEMASTER", "Blue"), claimed("CODEMASTER", "Red"), false),
    ).toBe(true);
  });

  it("true when both role and team change", () => {
    expect(
      needsHandoff(humanPhase("CODEBREAKER", "Blue"), claimed("CODEMASTER", "Red"), false),
    ).toBe(true);
  });

  it("true when nothing has been claimed yet", () => {
    expect(needsHandoff(humanPhase("CODEMASTER", "Red"), null, false)).toBe(true);
  });
});

/** AI turns (single-device) -- always false; AiTurnOverlay handles AI handoffs */

describe("needsHandoff — AI turns", () => {
  it("false when AI team matches claimed team", () => {
    expect(needsHandoff(aiPhase("CODEMASTER", "Red"), claimed("CODEMASTER", "Red"), false)).toBe(
      false,
    );
  });

  it("false when AI team differs from claimed team (AiTurnOverlay handles this, not handoff overlay)", () => {
    expect(needsHandoff(aiPhase("CODEMASTER", "Blue"), claimed("CODEMASTER", "Red"), false)).toBe(
      false,
    );
    expect(needsHandoff(aiPhase("CODEBREAKER", "Blue"), claimed("CODEBREAKER", "Red"), false)).toBe(
      false,
    );
  });

  it("false when nothing has been claimed yet (AiTurnOverlay shown immediately on refresh)", () => {
    expect(needsHandoff(aiPhase("CODEMASTER", "Red"), null, false)).toBe(false);
    expect(needsHandoff(aiPhase("CODEBREAKER", "Blue"), null, false)).toBe(false);
  });

  it("false regardless of role on AI turn", () => {
    expect(needsHandoff(aiPhase("CODEBREAKER", "Red"), claimed("CODEMASTER", "Red"), false)).toBe(
      false,
    );
  });
});
