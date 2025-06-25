/**
 * Round Creation Flow Test
 * Tests the new round creation flow that automatically deals cards and assigns roles
 */

import {
  ApiClient,
  extractUserIdFromToken,
  logError,
  logStep,
  logGameState,
  colors,
} from "./test-common";

export async function testRoundCreationFlow(verbose = true): Promise<void> {
  const api = new ApiClient(verbose);
  let gameId: string = "";

  try {
    console.log(
      `${colors.bright}🚀 Testing Round Creation Flow${colors.reset}\n`,
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

    // === TEST NEW ROUND CREATION FLOW ===
    logStep("Start Game", verbose);
    console.log(
      `    ${colors.cyan}POST /games/${gameId}/start${colors.reset}`,
    );
    
    const startResponse = await api.post(`/games/${gameId}/start`);
    if (!startResponse.data.success) {
      throw new Error(`Failed to start game: ${startResponse.data.error}`);
    }
    console.log(
      `    ${colors.green}✅ Game Started!${colors.reset}`,
    );

    logStep("Create Round (with automatic card dealing and role assignment)", verbose);
    console.log(
      `    ${colors.cyan}POST /games/${gameId}/rounds${colors.reset}`,
    );

    const roundResponse = await api.post(`/games/${gameId}/rounds`);
    
    if (roundResponse.data.success) {
      console.log(
        `    ${colors.green}✅ Round Created Successfully!${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Round Number: ${roundResponse.data.data.round.roundNumber}${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Round Status: ${roundResponse.data.data.round.status}${colors.reset}`,
      );
      console.log(
        `    ${colors.dim}Cards Dealt: ${roundResponse.data.data.round.cards.length}${colors.reset}`,
      );

      logStep("Start Round", verbose);
      console.log(
        `    ${colors.cyan}POST /games/${gameId}/rounds/${roundResponse.data.data.round.roundNumber}/start${colors.reset}`,
      );
      
      const startRoundResponse = await api.post(`/games/${gameId}/rounds/${roundResponse.data.data.round.roundNumber}/start`);
      if (!startRoundResponse.data.success) {
        throw new Error(`Failed to start round: ${startRoundResponse.data.error}`);
      }
      console.log(
        `    ${colors.green}✅ Round Started!${colors.reset}`,
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

      // Test 1: Try to start an already started game
      logStep("Test Starting Already Started Game", verbose);
      try {
        await api.post(`/games/${gameId}/start`);
        console.log(
          `    ${colors.red}✗ Failed - Should have rejected duplicate start${colors.reset}`,
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

      // Test 2: Try to start game with insufficient players
      logStep("Test Starting Game with Insufficient Players", verbose);
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
        await api.post(`/games/${newGameId}/start`);
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
        `\n${colors.green}${colors.bright}✅ Round Creation Flow Test Complete!${colors.reset}`,
      );
    } else {
      console.log(
        `    ${colors.red}✗ Round Creation Failed: ${roundResponse.data.error}${colors.reset}`,
      );
    }
  } catch (error) {
    logError("Round Creation Flow Test", error);
    throw error;
  }
}

// Export for use in other test files
export default testRoundCreationFlow;