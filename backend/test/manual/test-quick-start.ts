/**
 * Quick Start Endpoint Test
 * Tests the new quick-start endpoint that combines multiple operations
 */

import {
  ApiClient,
  extractUserIdFromToken,
  logError,
  logStep,
  logGameState,
  colors,
} from "./test-common";

export async function testQuickStartEndpoint(verbose = true): Promise<void> {
  const api = new ApiClient(verbose);
  let gameId: string = "";

  try {
    console.log(
      `${colors.bright}🚀 Testing Quick Start Endpoint${colors.reset}\n`,
    );

    // === SETUP PHASE ===
    logStep("Create Guest User", verbose);
    const authResponse = await api.post("/auth/guests", {});
    api.setAuthToken(authResponse.data.data.session.token);
    const userId = extractUserIdFromToken(
      authResponse.data.data.session.token,
    );

    logStep("Create Game", verbose);
    const gameResponse = await api.post("/games", {
      gameType: "SINGLE_DEVICE",
      gameFormat: "QUICK",
    });
    gameId = gameResponse.data.data.game.publicId;

    logStep("Add Players", verbose);
    await api.post(`/games/${gameId}/players`, [
      { playerName: "Alice", teamName: "Team Red" },
      { playerName: "Bob", teamName: "Team Red" },
      { playerName: "Charlie", teamName: "Team Blue" },
      { playerName: "Diana", teamName: "Team Blue" },
    ]);

    // === TEST QUICK START ===
    logStep("Test Quick Start Endpoint", verbose);
    console.log(
      `    ${colors.cyan}POST /games/${gameId}/quick-start${colors.reset}`,
    );

    const quickStartResponse = await api.post(`/games/${gameId}/quick-start`);

    if (quickStartResponse.data.success) {
      console.log(
        `    ${colors.green}✅ Quick Start Successful!${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Game Status: ${quickStartResponse.data.data.game.status}${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Round ID: ${quickStartResponse.data.data.round?.roundId || 'N/A'}${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Turn ID: ${quickStartResponse.data.data.turn?.turnId || 'N/A'}${colors.reset}`,
      );

      // Verify game state after quick start
      logStep("Verify Game State After Quick Start", verbose);
      const gameStateResponse = await api.get(`/games/${gameId}`);
      const gameState = gameStateResponse.data.data.game;
      logGameState(gameState, verbose);

      // Verify expected state
      const validations = [
        {
          name: "Game Status",
          expected: "IN_PROGRESS",
          actual: gameState.status,
        },
        {
          name: "Round Status",
          expected: "IN_PROGRESS",
          actual: gameState.currentRound?.status,
        },
        {
          name: "Cards Dealt",
          expected: true,
          actual: gameState.currentRound?.cards?.length > 0,
        },
        {
          name: "Turn Created",
          expected: true,
          actual: gameState.currentRound?.turns?.length > 0,
        },
      ];

      console.log(`\n    ${colors.bright}Validations:${colors.reset}`);
      validations.forEach((v) => {
        const passed = v.expected === v.actual;
        const icon = passed ? "✓" : "✗";
        const color = passed ? colors.green : colors.red;
        console.log(
          `    ${color}${icon}${colors.reset} ${v.name}: ${v.actual}`,
        );
      });

      // === TEST ERROR CASES ===
      console.log(`\n${colors.bright}Testing Error Cases:${colors.reset}`);

      // Test 1: Try quick start on already started game
      logStep("Test Quick Start on Already Started Game", verbose);
      try {
        await api.post(`/games/${gameId}/quick-start`);
        console.log(
          `    ${colors.red}✗ Failed - Should have rejected duplicate quick start${colors.reset}`,
        );
      } catch (error: any) {
        if (error.serverError?.error?.includes("Cannot start game")) {
          console.log(
            `    ${colors.green}✓ Correctly rejected - ${error.serverError.error}${colors.reset}`,
          );
        } else {
          console.log(
            `    ${colors.red}✗ Unexpected error: ${error.message}${colors.reset}`,
          );
        }
      }

      // Test 2: Try quick start with insufficient players
      logStep("Test Quick Start with Insufficient Players", verbose);
      const newGameResponse = await api.post("/games", {
        gameType: "SINGLE_DEVICE",
        gameFormat: "QUICK",
      });
      const newGameId = newGameResponse.data.data.game.publicId;

      // Add only 2 players (using correct team names)
      await api.post(`/games/${newGameId}/players`, [
        { playerName: "Test1", teamName: "Team Red" },
        { playerName: "Test2", teamName: "Team Red" },
      ]);

      try {
        await api.post(`/games/${newGameId}/quick-start`);
        console.log(
          `    ${colors.red}✗ Failed - Should have rejected insufficient players${colors.reset}`,
        );
      } catch (error: any) {
        if (
          error.serverError?.error?.includes("Cannot start game with less than")
        ) {
          console.log(
            `    ${colors.green}✓ Correctly rejected - ${error.serverError.error}${colors.reset}`,
          );
        } else {
          console.log(
            `    ${colors.red}✗ Unexpected error: ${error.message}${colors.reset}`,
          );
        }
      }

      console.log(
        `\n${colors.green}${colors.bright}✅ Quick Start Endpoint Test Complete!${colors.reset}`,
      );
    } else {
      console.log(
        `    ${colors.red}✗ Quick Start Failed: ${quickStartResponse.data.error}${colors.reset}`,
      );
    }
  } catch (error) {
    logError("Quick Start Test", error);
    throw error;
  }
}

// Export for use in other test files
export default testQuickStartEndpoint;