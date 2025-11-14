/**
 * Multi-Device Join Test
 * Tests that multiple users can join a multi-device game (one player each)
 */

import {
  ApiClient,
  colors,
  extractUserIdFromToken,
  logError,
  logStep,
} from "./test-common";

export async function testMultiDeviceJoin(verbose = true) {
  try {
    logStep("🚀 Starting Multi-Device Join Test", true);

    // 1. Create two guest users (two different JWTs)
    const client1 = new ApiClient(verbose);
    const client2 = new ApiClient(verbose);

    logStep("Creating User A", verbose);
    const guestA = await client1.post("/auth/guests", { username: "UserA" });
    client1.setAuthToken(guestA.data.data.token);
    const userAId = extractUserIdFromToken(guestA.data.data.token);

    logStep("Creating User B", verbose);
    const guestB = await client2.post("/auth/guests", { username: "UserB" });
    client2.setAuthToken(guestB.data.data.token);
    const userBId = extractUserIdFromToken(guestB.data.data.token);

    // 2. User A creates multi-device game
    logStep("User A creating multi-device game", verbose);
    const gameResponse = await client1.post("/games", { gameType: "MULTI_DEVICE" });
    const gameId = gameResponse.data.data.id;

    console.log(`${colors.cyan}Game ID: ${gameId}${colors.reset}`);

    // 3. User A joins as "Alice" on Team Red (using single object payload!)
    logStep("User A joining as Alice", verbose);
    const playerAResponse = await client1.post(`/games/${gameId}/players`, {
      playerName: "Alice",
      teamName: "Team Red",
    });

    const playerAId = playerAResponse.data.data.players[0].id;
    console.log(`${colors.green}✓ User A joined as Alice (${playerAId})${colors.reset}`);

    // 4. User B joins as "Bob" on Team Blue
    logStep("User B joining as Bob", verbose);
    const playerBResponse = await client2.post(`/games/${gameId}/players`, {
      playerName: "Bob",
      teamName: "Team Blue",
    });

    const playerBId = playerBResponse.data.data.players[0].id;
    console.log(`${colors.green}✓ User B joined as Bob (${playerBId})${colors.reset}`);

    // 5. User A tries to join again (should fail!)
    logStep("Testing that User A cannot join again", verbose);
    try {
      await client1.post(`/games/${gameId}/players`, {
        playerName: "Charlie",
        teamName: "Team Red",
      });
      throw new Error("❌ FAIL: User A should not be able to join twice!");
    } catch (error: any) {
      if (error.message?.includes("already have a player")) {
        console.log(`${colors.green}✓ Correctly rejected duplicate player for User A${colors.reset}`);
      } else {
        throw error;
      }
    }

    // 6. Verify game has 2 players
    logStep("Verifying game state", verbose);
    const gameState = await client1.get(`/games/${gameId}/players`);
    const totalPlayers = gameState.data.data.players.length;

    if (totalPlayers === 2) {
      console.log(`${colors.green}✓ Game has exactly 2 players${colors.reset}`);
    } else {
      throw new Error(`❌ Expected 2 players, got ${totalPlayers}`);
    }

    console.log(`\n${colors.bright}${colors.green}✅ Multi-Device Join Test PASSED${colors.reset}\n`);

    return {
      success: true,
      gameId,
      players: [
        { userId: userAId, playerId: playerAId, name: "Alice" },
        { userId: userBId, playerId: playerBId, name: "Bob" },
      ],
    };
  } catch (error) {
    logError("Multi-Device Join Test", error);
    console.log(`\n${colors.bright}${colors.red}❌ Multi-Device Join Test FAILED${colors.reset}\n`);
    throw error;
  }
}

// Run standalone if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verbose = process.env.VERBOSE === "true";
  testMultiDeviceJoin(verbose)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
