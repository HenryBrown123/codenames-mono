/**
 * Common utilities and types for game testing
 */

import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "../../src/common/db/db.types";
import { loadEnvFromPackageDir } from "../../src/common/config";

const { Pool } = pg;

/**
 * Load and validate environment variables
 */
let env;
try {
  env = loadEnvFromPackageDir();
} catch (error) {
  console.error("Failed to load environment variables:", error);
  process.exit(1);
}

export const API_BASE = `http://localhost:${env.PORT}/api`;
export const DB_CONNECTION_STRING = env.DATABASE_URL;

/**
 * Terminal colors for consistent logging
 */
export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

/**
 * Test scenario types
 */
export type TestOutcome =
  | "CORRECT_TEAM_CARD"
  | "OTHER_TEAM_CARD"
  | "BYSTANDER_CARD"
  | "ASSASSIN_CARD"
  | "RANDOM";

export type TestScenario = {
  name: string;
  description: string;
  strategy: TestOutcome[];
  expectedOutcome?: string;
};

export type TestResult = {
  scenario: string;
  success: boolean;
  roundCompleted: boolean;
  turnsPlayed: number;
  strategyExecuted: string;
  gameId: string;
  finalState: string;
  error?: string;
  duration?: number;
};

/**
 * API timing tracker
 */
class ApiTimingTracker {
  private static instance: ApiTimingTracker;
  private timings: Map<string, number[]> = new Map();

  static getInstance(): ApiTimingTracker {
    if (!ApiTimingTracker.instance) {
      ApiTimingTracker.instance = new ApiTimingTracker();
    }
    return ApiTimingTracker.instance;
  }

  private normalizeEndpoint(endpoint: string): string {
    // Split into method and path
    const [method, ...pathParts] = endpoint.split(" ");
    const path = pathParts.join(" ");

    // Replace obvious ID patterns with :id
    const normalizedPath = path
      .replace(/\/[a-z0-9]{8,}/gi, "/:id") // Replace long alphanumeric strings (likely IDs)
      .replace(/\/\d+/g, "/:id") // Replace pure numbers
      .replace(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
        "/:id",
      ) // UUIDs
      .replace(/\/[a-zA-Z0-9_-]{10,}/g, "/:id"); // Other likely ID formats

    return `${method} ${path}`;
  }

  recordTiming(endpoint: string, duration: number) {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    if (!this.timings.has(normalizedEndpoint)) {
      this.timings.set(normalizedEndpoint, []);
    }
    this.timings.get(normalizedEndpoint)!.push(duration);
  }

  getStats() {
    const stats = new Map<
      string,
      { count: number; avg: number; min: number; max: number }
    >();

    for (const [endpoint, times] of this.timings.entries()) {
      const count = times.length;
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / count);
      const min = Math.min(...times);
      const max = Math.max(...times);
      stats.set(endpoint, { count, avg, min, max });
    }

    return stats;
  }

  reset() {
    this.timings.clear();
  }
}

/**
 * HTTP client for API calls
 */
export class ApiClient {
  private authToken?: string;
  private verbose: boolean;
  private timingTracker = ApiTimingTracker.getInstance();
  private currentPlayerId?: string;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setCurrentPlayerId(playerId: string) {
    this.currentPlayerId = playerId;
  }

  getCurrentPlayerId(): string | undefined {
    return this.currentPlayerId;
  }

  private async request(method: string, url: string, data?: any) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    if (this.verbose) {
      console.log(
        `    ${colors.blue}→${colors.reset} ${colors.bright}${method}${colors.reset} ${colors.gray}${url}${colors.reset}`,
      );
      if (data && Object.keys(data).length > 0) {
        console.log(
          `      ${colors.dim}${JSON.stringify(data)}${colors.reset}`,
        );
      }
    }

    const startTime = performance.now();

    const response = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const endTime = performance.now();
    const requestTime = Math.round(endTime - startTime);

    // Track timing for aggregation
    this.timingTracker.recordTiming(`${method} ${url}`, requestTime);

    const responseData = await response.json();

    if (!response.ok) {
      // Always log failures
      console.error(
        `    ${colors.red}✗ ${method} ${url} failed:${colors.reset}`,
        {
          status: response.status,
          data: responseData,
        },
      );

      const error = new Error(`API call failed: ${response.status}`);
      (error as any).serverError = responseData;
      (error as any).serverStack = responseData?.details?.stack;
      throw error;
    }

    if (this.verbose) {
      console.log(
        `    ${colors.green}✓${colors.reset} ${colors.dim}${JSON.stringify(responseData, null, 6).replace(/\n/g, "\n      ")}${colors.reset}`,
      );
    }

    return {
      status: response.status,
      data: responseData,
    };
  }

  async get(url: string) {
    return this.request("GET", url);
  }
  async post(url: string, data?: any) {
    return this.request("POST", url, data);
  }
  async patch(url: string, data?: any) {
    return this.request("PATCH", url, data);
  }
  async delete(url: string) {
    return this.request("DELETE", url);
  }

  // New helper methods for player-context-aware API calls
  async getGameState(gameId: string, playerId?: string) {
    const playerIdToUse = playerId || this.currentPlayerId;
    if (!playerIdToUse) {
      throw new Error("Player ID required for game state - call setCurrentPlayerId() or pass playerId parameter");
    }
    return this.request("GET", `/games/${gameId}?playerId=${encodeURIComponent(playerIdToUse)}`);
  }

  async getPlayers(gameId: string) {
    return this.request("GET", `/games/${gameId}/players`);
  }

  async giveClue(gameId: string, roundNumber: number, clueData: { word: string; targetCardCount: number }, playerId?: string) {
    const playerIdToUse = playerId || this.currentPlayerId;
    if (!playerIdToUse) {
      throw new Error("Player ID required for giving clue - call setCurrentPlayerId() or pass playerId parameter");
    }
    return this.request("POST", `/games/${gameId}/rounds/${roundNumber}/clues`, {
      ...clueData,
      playerId: playerIdToUse,
    });
  }

  async makeGuess(gameId: string, roundNumber: number, guessData: { cardWord: string }, playerId?: string) {
    const playerIdToUse = playerId || this.currentPlayerId;
    if (!playerIdToUse) {
      throw new Error("Player ID required for making guess - call setCurrentPlayerId() or pass playerId parameter");
    }
    return this.request("POST", `/games/${gameId}/rounds/${roundNumber}/guesses`, {
      ...guessData,
      playerId: playerIdToUse,
    });
  }

  // Helper to automatically find and set the active player
  async setActivePlayer(gameId: string) {
    const playersResponse = await this.getPlayers(gameId);
    const activePlayers = playersResponse.data.data.players.filter(
      (player: any) => player.status === "ACTIVE"
    );
    
    if (activePlayers.length === 0) {
      // No active players might mean the round/game is complete
      if (this.verbose) {
        console.log(
          `    ${colors.yellow}⚠ No active players found - game/round may be complete${colors.reset}`
        );
      }
      return null;
    }
    
    // Use the first active player
    this.setCurrentPlayerId(activePlayers[0].publicId);
    
    if (this.verbose) {
      console.log(
        `    ${colors.cyan}👤 Set active player: ${activePlayers[0].name} (${activePlayers[0].role}) on ${activePlayers[0].teamName}${colors.reset}`
      );
    }
    
    return activePlayers[0];
  }

  static getTimingStats() {
    return ApiTimingTracker.getInstance().getStats();
  }

  static resetTimings() {
    ApiTimingTracker.getInstance().reset();
  }
}

/**
 * Database client for strategic decision making
 */
export class StrategicDbClient {
  private db: Kysely<DB>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool }),
    });
  }

  async getRoundCards(gamePublicId: string) {
    const cards = await this.db
      .selectFrom("cards")
      .innerJoin("rounds", "cards.round_id", "rounds.id")
      .innerJoin("games", "rounds.game_id", "games.id")
      .leftJoin("teams", "cards.team_id", "teams.id")
      .where("games.public_id", "=", gamePublicId)
      .where("rounds.round_number", "=", 1)
      .select([
        "cards.word",
        "cards.card_type",
        "cards.selected",
        "teams.team_name",
        "cards.team_id",
      ])
      .execute();

    return cards.map((card) => ({
      word: card.word,
      cardType: card.card_type,
      selected: card.selected,
      teamName: card.team_name,
      teamId: card.team_id,
    }));
  }

  async close() {
    await this.db.destroy();
  }
}
// Update the CardSelectionStrategy.selectCardForOutcome method in test-common.ts:
// Update the CardSelectionStrategy.selectCardForOutcome method in test-common.ts:

export class CardSelectionStrategy {
  private dbClient: StrategicDbClient;

  constructor(dbClient: StrategicDbClient) {
    this.dbClient = dbClient;
  }

  async selectCardForOutcome(
    gameId: string,
    userId: number,
    desiredOutcome: TestOutcome,
    gameState: any, // Game state for player context
  ): Promise<string | null> {
    // Get team context from game state (this works fine)
    const playerContext = gameState.playerContext;
    if (!playerContext || !playerContext.teamName) {
      return null;
    }

    // Get cards from DB (bypasses visibility rules!)
    const cards = await this.dbClient.getRoundCards(gameId);
    const availableCards = cards.filter((card) => !card.selected);

    if (availableCards.length === 0) {
      return null;
    }

    switch (desiredOutcome) {
      case "CORRECT_TEAM_CARD":
        const teamCards = availableCards.filter(
          (card) =>
            card.cardType === "TEAM" &&
            card.teamName === playerContext.teamName,
        );
        return teamCards.length > 0 ? teamCards[0].word : null;

      case "OTHER_TEAM_CARD":
        const otherTeamCards = availableCards.filter(
          (card) =>
            card.cardType === "TEAM" &&
            card.teamName !== playerContext.teamName,
        );
        return otherTeamCards.length > 0 ? otherTeamCards[0].word : null;

      case "BYSTANDER_CARD":
        const bystanderCards = availableCards.filter(
          (card) => card.cardType === "BYSTANDER",
        );
        return bystanderCards.length > 0 ? bystanderCards[0].word : null;

      case "ASSASSIN_CARD":
        const assassinCards = availableCards.filter(
          (card) => card.cardType === "ASSASSIN",
        );
        return assassinCards.length > 0 ? assassinCards[0].word : null;

      case "RANDOM":
      default:
        return availableCards[Math.floor(Math.random() * availableCards.length)]
          .word;
    }
  }

  // Update analyzeBoardState to also use game state instead of DB queries
  async analyzeBoardState(gameId: string, userId: number, gameState?: any) {
    // If gameState is provided, use it; otherwise fall back to DB queries
    if (gameState) {
      const playerContext = gameState.playerContext;
      if (!playerContext || !playerContext.teamName) {
        return null;
      }

      const allCards = gameState.currentRound?.cards || [];

      return {
        totalCards: allCards.length,
        selectedCards: allCards.filter((c: any) => c.selected).length,
        myTeamRemaining: allCards.filter(
          (c: any) =>
            c.cardType === "TEAM" &&
            c.teamName === playerContext.teamName &&
            !c.selected,
        ).length,
        otherTeamRemaining: allCards.filter(
          (c: any) =>
            c.cardType === "TEAM" &&
            c.teamName !== playerContext.teamName &&
            !c.selected,
        ).length,
        bystandersRemaining: allCards.filter(
          (c: any) => c.cardType === "BYSTANDER" && !c.selected,
        ).length,
        assassinRemaining: allCards.filter(
          (c: any) => c.cardType === "ASSASSIN" && !c.selected,
        ).length,
        teamContext: {
          teamName: playerContext.teamName,
          teamId: null, // Not needed when using game state
        },
      };
    }
  }
}

/**
 * Utility functions
 */
export const generateRandomClueWord = () => {
  const prefix = "clue";
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomSuffix}`;
};

export const extractUserIdFromToken = (token: string): number => {
  const tokenPayload = JSON.parse(atob(token.split(".")[1]));
  return tokenPayload.userId;
};

/**
 * Logging utilities
 */
export const logError = (step: string, error: any) => {
  console.log(
    `    ${colors.red}✗${colors.reset} ${colors.red}${step} - ${error.message}${colors.reset}`,
  );

  if (error.serverError) {
    console.log(`\n${colors.yellow}Server Error Details:${colors.reset}`);
    console.log(
      `${colors.dim}${JSON.stringify(error.serverError, null, 2)}${colors.reset}`,
    );
  }

  if (error.stack) {
    console.log(`\n${colors.yellow}Client Stack Trace:${colors.reset}`);
    const stackLines = error.stack.split("\n");
    stackLines.forEach((line: string) => {
      console.log(`${colors.dim}${line}${colors.reset}`);
    });
  }
  console.log("");
};

export const logStep = (step: string, verbose: boolean) => {
  if (!verbose) return;
  console.log(
    `\n${colors.cyan}[STEP]${colors.reset} ${colors.bright}${step}${colors.reset}`,
  );
};

export const logGameState = (gameState: any, verbose: boolean) => {
  if (!verbose) return;

  console.log(`    ${colors.magenta}🎮 Game State:${colors.reset}`);
  console.log(
    `      ${colors.bright}Status:${colors.reset} ${gameState.status} | ${colors.bright}Round:${colors.reset} ${gameState.currentRound?.roundNumber || "None"} (${gameState.currentRound?.status || "N/A"})`,
  );

  const teams = gameState.teams || [];
  const teamScores = teams
    .map((team: any) => `${team.name}: ${team.score}`)
    .join(" vs ");
  console.log(`      ${colors.bright}Score:${colors.reset} ${teamScores}`);

  const ctx = gameState.playerContext;
  console.log(
    `      ${colors.bright}Active:${colors.reset} ${ctx?.playerName || "Unknown"} (${ctx?.role}) on ${ctx?.teamName}`,
  );

  if (gameState.currentRound) {
    const cards = gameState.currentRound.cards || [];
    const teamRedCards = cards.filter(
      (c: any) => c.teamName === "Team Red" && !c.selected,
    ).length;
    const teamBlueCards = cards.filter(
      (c: any) => c.teamName === "Team Blue" && !c.selected,
    ).length;
    const bystanderCards = cards.filter(
      (c: any) => c.cardType === "BYSTANDER" && !c.selected,
    ).length;
    const assassinCards = cards.filter(
      (c: any) => c.cardType === "ASSASSIN" && !c.selected,
    ).length;

    console.log(
      `      ${colors.bright}Cards Remaining:${colors.reset} Red: ${teamRedCards} | Blue: ${teamBlueCards} | Neutral: ${bystanderCards} | Assassin: ${assassinCards}`,
    );
  }
  console.log("");
};

/**
 * Print API timing statistics
 */
export const printApiTimingStats = () => {
  const stats = ApiClient.getTimingStats();

  if (stats.size === 0) {
    console.log(`${colors.yellow}No API timing data collected${colors.reset}`);
    return;
  }

  console.log(`\n${colors.bright}📡 API Performance Summary${colors.reset}`);
  console.log(`${"=".repeat(60)}`);

  // Sort by average response time descending
  const sortedStats = Array.from(stats.entries()).sort(
    (a, b) => b[1].avg - a[1].avg,
  );

  for (const [endpoint, timing] of sortedStats) {
    const { count, avg, min, max } = timing;
    console.log(
      `${colors.cyan}${endpoint.padEnd(30)}${colors.reset} ${colors.bright}${avg}ms${colors.reset} avg (${min}-${max}ms, ${count}x)`,
    );
  }
};

/**
 * Reset API timing statistics
 */
export const resetApiTimings = () => {
  ApiClient.resetTimings();
};
