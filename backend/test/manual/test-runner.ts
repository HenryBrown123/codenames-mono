/**
 * Core test execution engine
 * Handles the actual game flow testing logic
 */

import {
  ApiClient,
  StrategicDbClient,
  CardSelectionStrategy,
  generateRandomClueWord,
  extractUserIdFromToken,
  logError,
  logStep,
  logGameState,
  colors,
  DB_CONNECTION_STRING,
  type TestScenario,
  type TestResult,
} from "./test-common";

/**
 * Runs a complete strategic game test for the given scenario
 */
export async function runGameTest(
  scenario: TestScenario,
  verbose = true,
): Promise<TestResult> {
  const startTime = Date.now();
  const api = new ApiClient(verbose);
  const dbClient = new StrategicDbClient(DB_CONNECTION_STRING);
  const strategy = new CardSelectionStrategy(dbClient);

  let gameId: string = "";
  let strategyIndex = 0;
  let currentUserId: number | null = null;

  try {
    if (verbose) {
      console.log(
        `${colors.bright}🎯 Running Scenario: ${scenario.name}${colors.reset}`,
      );
      console.log(`${colors.dim}   ${scenario.description}${colors.reset}\n`);
    } else {
      process.stdout.write(
        `${colors.cyan}${scenario.name}${colors.reset} ... `,
      );
    }

    // === SETUP PHASE ===
    logStep("Create Guest User", verbose);
    const authResponse = await api.post("/auth/guests", {});
    api.setAuthToken(authResponse.data.data.session.token);
    currentUserId = extractUserIdFromToken(
      authResponse.data.data.session.token,
    );

    logStep("Create and Setup Game", verbose);
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
    const maxTurns = 30;
    let turnCount = 0;

    // Show initial board analysis
    logStep("Initial Board Analysis", verbose);
    const initialAnalysis = await strategy.analyzeBoardState(
      gameId,
      currentUserId!,
    );
    if (initialAnalysis && verbose) {
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

      logStep(`Strategic Turn ${turnCount}`, verbose);
      const stateResponse = await api.get(`/games/${gameId}`);
      gameState = stateResponse.data.data.game;
      logGameState(gameState, verbose);

      if (gameState.currentRound?.status === "COMPLETED") {
        if (verbose) {
          console.log(`    ${colors.green}🏁 Round completed!${colors.reset}`);
        }
        roundComplete = true;
        break;
      }

      const activeTurn = gameState.currentRound?.turns?.find(
        (t: any) => t.status === "ACTIVE",
      );
      if (!activeTurn) {
        if (verbose) {
          console.log(
            `    ${colors.yellow}⚠ No active turn found${colors.reset}`,
          );
        }
        break;
      }

      if (!activeTurn.clue) {
        // Give clue
        logStep(`Strategic Clue Giving (${activeTurn.teamName})`, verbose);
        try {
          const clueWord = generateRandomClueWord();
          await api.post(`/games/${gameId}/rounds/1/clues`, {
            word: clueWord,
            targetCardCount: 2,
          });
          if (verbose) {
            console.log(
              `    ${colors.cyan}🗣️ Gave clue: "${clueWord}" for 2 cards${colors.reset}`,
            );
          }
        } catch (error) {
          if (verbose) {
            console.log(
              `    ${colors.yellow}⚠ Clue giving failed${colors.reset}`,
            );
          }
          throw error;
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
          logStep(`Strategic Guess: Targeting ${desiredOutcome}`, verbose);
          if (verbose) {
            console.log(
              `    ${colors.cyan}🎯 Strategy: ${desiredOutcome} → Guessing "${targetCard}"${colors.reset}`,
            );
          }

          try {
            const guessResponse = await api.post(
              `/games/${gameId}/rounds/1/guesses`,
              {
                cardWord: targetCard,
              },
            );

            const guessResult = guessResponse.data.data;
            if (verbose) {
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
            }

            strategyIndex++;
          } catch (error) {
            if (verbose) {
              console.log(
                `    ${colors.yellow}⚠ Strategic guess failed - ${(error as any).message}${colors.reset}`,
              );
            }
            throw error;
          }
        } else {
          if (verbose) {
            console.log(
              `    ${colors.yellow}⚠ No cards available for desired outcome: ${desiredOutcome}${colors.reset}`,
            );
          }

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
        if (verbose) {
          console.log(
            `    ${colors.yellow}⚠ Turn waiting for transition${colors.reset}`,
          );
        }
        break;
      }
    }

    // === FINAL ANALYSIS ===
    logStep("Final Analysis", verbose);
    const finalStateResponse = await api.get(`/games/${gameId}`);
    const finalState = finalStateResponse.data.data.game;
    logGameState(finalState, verbose);

    const finalAnalysis = await strategy.analyzeBoardState(
      gameId,
      currentUserId!,
    );

    const endTime = Date.now();
    const testResult: TestResult = {
      scenario: scenario.name,
      success: true,
      roundCompleted: finalState.currentRound?.status === "COMPLETED",
      turnsPlayed: turnCount,
      strategyExecuted: `${strategyIndex}/${scenario.strategy.length}`,
      gameId: gameId,
      finalState: finalState.currentRound?.status || "Unknown",
      duration: endTime - startTime,
    };

    if (verbose) {
      if (finalAnalysis) {
        console.log(
          `    ${colors.cyan}📊 Final Board Analysis:${colors.reset}`,
        );
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
        `${colors.bright}Actual:${colors.reset} ${testResult.roundCompleted ? "Round completed" : "Round in progress"}`,
      );
      console.log(
        `${colors.bright}Duration:${colors.reset} ${testResult.duration}ms`,
      );
    } else {
      const status = testResult.roundCompleted
        ? `${colors.green}✓${colors.reset}`
        : `${colors.yellow}~${colors.reset}`;
      console.log(`${status} (${turnCount} turns, ${testResult.duration}ms)`);
    }

    return testResult;
  } catch (error: any) {
    const endTime = Date.now();
    const testResult: TestResult = {
      scenario: scenario.name,
      success: false,
      roundCompleted: false,
      turnsPlayed: 0,
      strategyExecuted: `${strategyIndex}/${scenario.strategy.length}`,
      gameId: gameId,
      finalState: "Error",
      error: error.message,
      duration: endTime - startTime,
    };

    if (verbose) {
      logError(`Scenario "${scenario.name}" Failed`, error);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${error.message}`);
    }

    return testResult;
  } finally {
    await dbClient.close();
  }
}
