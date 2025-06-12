/**
 * Enhanced game flow test script with strategic card selection
 * Uses direct database queries to make informed decisions about which cards to guess
 */

import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "../src/common/db/db.types";
import { loadEnvFromPackageDir } from "../src/common/config";

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

const API_BASE = `http://localhost:${env.PORT}/api`;

/**
 * Database client for strategic decision making
 */
class StrategicDbClient {
  private db: Kysely<DB>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool }),
    });
  }

  /**
   * Gets all cards for a round with their team assignments and selection status
   */
  async getRoundCards(gamePublicId: string) {
    const cards = await this.db
      .selectFrom("cards")
      .innerJoin("rounds", "cards.round_id", "rounds.id")
      .innerJoin("games", "rounds.game_id", "games.id")
      .leftJoin("teams", "cards.team_id", "teams.id")
      .where("games.public_id", "=", gamePublicId)
      .where("rounds.round_number", "=", 1) // Current round
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

  /**
   * Gets the current team's ID for strategic decisions
   */
  async getCurrentTeamContext(gamePublicId: string, userId: number) {
    const player = await this.db
      .selectFrom("players")
      .innerJoin("games", "players.game_id", "games.id")
      .innerJoin("teams", "players.team_id", "teams.id")
      .where("games.public_id", "=", gamePublicId)
      .where("players.user_id", "=", userId)
      .select(["players.team_id", "teams.team_name"])
      .executeTakeFirst();

    return player
      ? {
          teamId: player.team_id,
          teamName: player.team_name,
        }
      : null;
  }

  async close() {
    await this.db.destroy();
  }
}

/**
 * Strategic card selection strategies for different test scenarios
 */
class CardSelectionStrategy {
  private dbClient: StrategicDbClient;

  constructor(dbClient: StrategicDbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Selects cards to achieve a specific outcome for testing
   */
  async selectCardForOutcome(
    gameId: string,
    userId: number,
    desiredOutcome:
      | "CORRECT_TEAM_CARD"
      | "OTHER_TEAM_CARD"
      | "BYSTANDER_CARD"
      | "ASSASSIN_CARD"
      | "RANDOM",
  ): Promise<string | null> {
    const cards = await this.dbClient.getRoundCards(gameId);
    const teamContext = await this.dbClient.getCurrentTeamContext(
      gameId,
      userId,
    );

    if (!teamContext) return null;

    const availableCards = cards.filter((card) => !card.selected);

    if (availableCards.length === 0) return null;

    switch (desiredOutcome) {
      case "CORRECT_TEAM_CARD":
        const teamCards = availableCards.filter(
          (card) =>
            card.cardType === "TEAM" && card.teamId === teamContext.teamId,
        );
        return teamCards.length > 0 ? teamCards[0].word : null;

      case "OTHER_TEAM_CARD":
        const otherTeamCards = availableCards.filter(
          (card) =>
            card.cardType === "TEAM" && card.teamId !== teamContext.teamId,
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

  /**
   * Analyzes current board state for strategic insights
   */
  async analyzeBoardState(gameId: string, userId: number) {
    const cards = await this.dbClient.getRoundCards(gameId);
    const teamContext = await this.dbClient.getCurrentTeamContext(
      gameId,
      userId,
    );

    if (!teamContext) return null;

    const analysis = {
      totalCards: cards.length,
      selectedCards: cards.filter((c) => c.selected).length,
      myTeamRemaining: cards.filter(
        (c) =>
          c.cardType === "TEAM" &&
          c.teamId === teamContext.teamId &&
          !c.selected,
      ).length,
      otherTeamRemaining: cards.filter(
        (c) =>
          c.cardType === "TEAM" &&
          c.teamId !== teamContext.teamId &&
          !c.selected,
      ).length,
      bystandersRemaining: cards.filter(
        (c) => c.cardType === "BYSTANDER" && !c.selected,
      ).length,
      assassinRemaining: cards.filter(
        (c) => c.cardType === "ASSASSIN" && !c.selected,
      ).length,
      teamContext,
    };

    return analysis;
  }
}

/**
 * Test scenario definitions
 */
type TestScenario = {
  name: string;
  description: string;
  strategy: (
    | "CORRECT_TEAM_CARD"
    | "OTHER_TEAM_CARD"
    | "BYSTANDER_CARD"
    | "ASSASSIN_CARD"
    | "RANDOM"
  )[];
  expectedOutcome?: string;
};

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "Quick Victory",
    description: "Team wins by guessing all their cards correctly",
    strategy: Array(9).fill("CORRECT_TEAM_CARD"),
    expectedOutcome: "Team victory via completion",
  },
  {
    name: "Assassin Defeat",
    description: "Team loses by hitting the assassin",
    strategy: ["ASSASSIN_CARD"],
    expectedOutcome: "Immediate loss via assassin",
  },
  {
    name: "Mixed Strategy",
    description: "Realistic gameplay with mixed outcomes",
    strategy: [
      "CORRECT_TEAM_CARD",
      "CORRECT_TEAM_CARD",
      "BYSTANDER_CARD",
      "CORRECT_TEAM_CARD",
      "OTHER_TEAM_CARD",
    ],
    expectedOutcome: "Turn transitions and strategic play",
  },
  {
    name: "Random Play",
    description: "Completely random card selection",
    strategy: Array(15).fill("RANDOM"),
    expectedOutcome: "Unpredictable gameplay",
  },
];

// === EXISTING API CLIENT AND LOGGING CODE ===
// (Keep all your existing ApiClient, colors, logging functions...)

class ApiClient {
  private authToken?: string;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request(method: string, url: string, data?: any) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    //logRequest(method, url, data);

    const response = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
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

    //logResponse(responseData);

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
}

// Terminal colors and logging (keeping your existing code)
const colors = {
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

let stepCounter = 0;
let currentUserId: number | null = null;

/**
 * Generates a random clue word that's guaranteed to be unique and not match any card words
 */
const generateRandomClueWord = () => {
  const prefix = "clue";
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomSuffix}`;
};

const logStep = (step: string) => {
  stepCounter++;
  console.log(
    `\n${colors.cyan}[${stepCounter.toString().padStart(2, "0")}]${colors.reset} ${colors.bright}${step}${colors.reset}`,
  );
};

const logRequest = (method: string, url: string, data?: any) => {
  console.log(
    `    ${colors.blue}→${colors.reset} ${colors.bright}${method}${colors.reset} ${colors.gray}${url}${colors.reset}`,
  );
  if (data && Object.keys(data).length > 0) {
    console.log(`      ${colors.dim}${JSON.stringify(data)}${colors.reset}`);
  }
};

const logResponse = (data: any) => {
  console.log(
    `    ${colors.green}✓${colors.reset} ${colors.dim}${JSON.stringify(data, null, 6).replace(/\n/g, "\n      ")}${colors.reset}`,
  );
};

const logError = (step: string, error: any) => {
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

  if (error.serverStack) {
    console.log(`\n${colors.yellow}Server Stack Trace:${colors.reset}`);
    if (typeof error.serverStack === "object") {
      Object.entries(error.serverStack).forEach(([key, value]) => {
        console.log(`${colors.dim}${value}${colors.reset}`);
      });
    } else if (typeof error.serverStack === "string") {
      const stackLines = error.serverStack.split("\n");
      stackLines.forEach((line: string) => {
        console.log(`${colors.dim}${line}${colors.reset}`);
      });
    }
  }

  console.log("");
};

const logGameState = (gameState: any) => {
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
    const activeTurn = gameState.currentRound.turns?.find(
      (t: any) => t.status === "ACTIVE",
    );

    if (activeTurn) {
      console.log(
        `      ${colors.bright}Current Turn:${colors.reset} ${activeTurn.teamName} (${activeTurn.guessesRemaining} guesses left)`,
      );
      if (activeTurn.clue) {
        console.log(
          `      ${colors.bright}Active Clue:${colors.reset} "${activeTurn.clue.word}" for ${activeTurn.clue.number} cards`,
        );
      }
    }

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
 * Enhanced game test with strategic card selection
 */
async function runStrategicGameTest(
  scenario: TestScenario,
  dbConnectionString: string,
) {
  const api = new ApiClient();
  const dbClient = new StrategicDbClient(dbConnectionString);
  const strategy = new CardSelectionStrategy(dbClient);

  let gameId: string = "";
  let strategyIndex = 0;

  try {
    console.log(
      `${colors.bright}🎯 Running Scenario: ${scenario.name}${colors.reset}`,
    );
    console.log(`${colors.dim}   ${scenario.description}${colors.reset}\n`);

    // === SETUP PHASE ===
    logStep("Create Guest User");
    const authResponse = await api.post("/auth/guests", {});
    api.setAuthToken(authResponse.data.data.session.token);

    // Extract user ID from token for database queries
    const tokenPayload = JSON.parse(
      atob(authResponse.data.data.session.token.split(".")[1]),
    );
    currentUserId = tokenPayload.userId;

    logStep("Create and Setup Game");
    const gameResponse = await api.post("/games", {
      gameType: "SINGLE_DEVICE",
      gameFormat: "QUICK",
    });
    gameId = gameResponse.data.data.game.publicId;

    await api.post(`/games/${gameId}/players`, [
      { playerName: "Alice", teamName: "Team Red" },
      { playerName: "Bob", teamName: "Team Red" },
      { playerName: "Charlie", teamName: "Team Blue" },
      { playerName: "Diana", teamName: "Team Blue" },
    ]);

    await api.post(`/games/${gameId}/start`);
    await api.post(`/games/${gameId}/rounds`);
    await api.post(`/games/${gameId}/rounds/1/deal`);
    await api.post(`/games/${gameId}/rounds/1/start`);

    // === STRATEGIC GAMEPLAY ===
    let gameState: any;
    let roundComplete = false;
    let maxTurns = 30;
    let turnCount = 0;

    // Show initial board analysis
    logStep("Initial Board Analysis");
    const initialAnalysis = await strategy.analyzeBoardState(
      gameId,
      currentUserId!,
    );
    if (initialAnalysis) {
      console.log(`    ${colors.cyan}📊 Board State:${colors.reset}`);
      console.log(
        `      My Team (${initialAnalysis.teamContext.teamName}): ${initialAnalysis.myTeamRemaining} cards remaining`,
      );
      console.log(
        `      Other Team: ${initialAnalysis.otherTeamRemaining} cards remaining`,
      );
      console.log(
        `      Bystanders: ${initialAnalysis.bystandersRemaining}, Assassin: ${initialAnalysis.assassinRemaining}`,
      );
    }

    while (
      !roundComplete &&
      turnCount < maxTurns &&
      strategyIndex < scenario.strategy.length
    ) {
      turnCount++;

      logStep(`Strategic Turn ${turnCount}`);
      const stateResponse = await api.get(`/games/${gameId}`);
      gameState = stateResponse.data.data.game;
      logGameState(gameState);

      if (gameState.currentRound?.status === "COMPLETED") {
        console.log(`    ${colors.green}🏁 Round completed!${colors.reset}`);
        roundComplete = true;
        break;
      }

      const activeTurn = gameState.currentRound?.turns?.find(
        (t: any) => t.status === "ACTIVE",
      );
      if (!activeTurn) {
        console.log(
          `    ${colors.yellow}⚠ No active turn found${colors.reset}`,
        );
        break;
      }

      if (!activeTurn.clue) {
        // Give clue
        logStep(`Strategic Clue Giving (${activeTurn.teamName})`);
        try {
          const clueWord = generateRandomClueWord();
          await api.post(`/games/${gameId}/rounds/1/clues`, {
            word: clueWord,
            targetCardCount: 2,
          });
          console.log(
            `    ${colors.cyan}🗣️ Gave clue: "${clueWord}" for 2 cards${colors.reset}`,
          );
        } catch (error) {
          console.log(
            `    ${colors.yellow}⚠ Clue giving failed${colors.reset}`,
          );
          break;
        }
      } else if (activeTurn.clue && activeTurn.guessesRemaining > 0) {
        // Strategic guess based on scenario
        const desiredOutcome =
          scenario.strategy[strategyIndex % scenario.strategy.length];
        const targetCard = await strategy.selectCardForOutcome(
          gameId,
          currentUserId!,
          desiredOutcome,
        );

        if (targetCard) {
          logStep(`Strategic Guess: Targeting ${desiredOutcome}`);
          console.log(
            `    ${colors.cyan}🎯 Strategy: ${desiredOutcome} → Guessing "${targetCard}"${colors.reset}`,
          );

          try {
            const guessResponse = await api.post(
              `/games/${gameId}/rounds/1/guesses`,
              {
                cardWord: targetCard,
              },
            );

            const guessResult = guessResponse.data.data;
            console.log(
              `    ${colors.bright}Result: ${guessResult.guess.outcome}${colors.reset}`,
            );

            // Show strategy effectiveness
            const wasExpected =
              guessResult.guess.outcome === desiredOutcome ||
              desiredOutcome === "RANDOM";
            if (wasExpected) {
              console.log(
                `    ${colors.green}✅ Strategy executed as planned${colors.reset}`,
              );
            } else {
              console.log(
                `    ${colors.yellow}⚠ Unexpected outcome (database/API state mismatch?)${colors.reset}`,
              );
            }

            strategyIndex++;
          } catch (error) {
            console.log(
              `    ${colors.yellow}⚠ Strategic guess failed - ${(error as any).message}${colors.reset}`,
            );
            break;
          }
        } else {
          console.log(
            `    ${colors.yellow}⚠ No cards available for desired outcome: ${desiredOutcome}${colors.reset}`,
          );

          // Fall back to any available card
          const fallbackCard = await strategy.selectCardForOutcome(
            gameId,
            currentUserId!,
            "RANDOM",
          );
          if (fallbackCard) {
            await api.post(`/games/${gameId}/rounds/1/guesses`, {
              cardWord: fallbackCard,
            });
            strategyIndex++;
          } else {
            break;
          }
        }
      } else {
        console.log(
          `    ${colors.yellow}⚠ Turn waiting for transition${colors.reset}`,
        );
        break;
      }
    }

    // === FINAL ANALYSIS ===
    logStep("Final Analysis");
    const finalStateResponse = await api.get(`/games/${gameId}`);
    const finalState = finalStateResponse.data.data.game;
    logGameState(finalState);

    const finalAnalysis = await strategy.analyzeBoardState(
      gameId,
      currentUserId!,
    );
    if (finalAnalysis) {
      console.log(`    ${colors.cyan}📊 Final Board Analysis:${colors.reset}`);
      console.log(
        `      Cards Selected: ${finalAnalysis.totalCards - finalAnalysis.myTeamRemaining - finalAnalysis.otherTeamRemaining - finalAnalysis.bystandersRemaining - finalAnalysis.assassinRemaining}/${finalAnalysis.totalCards}`,
      );
      console.log(
        `      Strategy Execution: ${strategyIndex}/${scenario.strategy.length} moves completed`,
      );
    }

    console.log(
      `\n${colors.green}✅ Scenario "${scenario.name}" Completed!${colors.reset}`,
    );
    console.log(
      `${colors.bright}Expected:${colors.reset} ${scenario.expectedOutcome}`,
    );
    console.log(
      `${colors.bright}Actual:${colors.reset} ${finalState.currentRound?.status === "COMPLETED" ? "Round completed" : "Round in progress"}`,
    );
  } catch (error: any) {
    logError(`Scenario "${scenario.name}" Failed`, error);
    throw error;
  } finally {
    await dbClient.close();
  }
}

/**
 * Main function with scenario selection
 */
async function main() {
  const args = process.argv.slice(2);
  const scenarioName = args[0];

  if (scenarioName === "all") {
    console.log(
      `${colors.bright}🚀 Running All Test Scenarios${colors.reset}\n`,
    );

    for (const scenario of TEST_SCENARIOS) {
      try {
        await runStrategicGameTest(scenario, env.DATABASE_URL);
        console.log(
          `${colors.green}✅ ${scenario.name} passed${colors.reset}\n`,
        );
      } catch (error) {
        console.log(`${colors.red}❌ ${scenario.name} failed${colors.reset}\n`);
        // Continue with other scenarios
      }
    }
  } else if (scenarioName) {
    const scenario = TEST_SCENARIOS.find((s) =>
      s.name.toLowerCase().includes(scenarioName.toLowerCase()),
    );
    if (scenario) {
      await runStrategicGameTest(scenario, env.DATABASE_URL);
    } else {
      console.log(
        `${colors.red}❌ Scenario "${scenarioName}" not found${colors.reset}`,
      );
      console.log(
        `Available scenarios: ${TEST_SCENARIOS.map((s) => s.name).join(", ")}`,
      );
      process.exit(1);
    }
  } else {
    console.log(`${colors.bright}Strategic Game Test Runner${colors.reset}`);
    console.log("Usage: npx tsx test-strategic.ts [scenario|all]");
    console.log("\nAvailable scenarios:");
    TEST_SCENARIOS.forEach((scenario) => {
      console.log(
        `  ${colors.cyan}${scenario.name}${colors.reset}: ${scenario.description}`,
      );
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
