import { test, expect } from "@playwright/test";
import { setupGameViaApi, giveClue, makeGuess, getGameState } from "../fixtures/game-helpers";

/**
 * API-level integration: clue + guess cycle works end-to-end.
 */
test("clue and guess cycle via API", async ({ request }) => {
  const { gameId, cookie, gameState } = await setupGameViaApi(request);

  const firstTeamName = gameState.currentRound.turns?.[0]?.teamName;
  const teamCard = gameState.currentRound.cards.find(
    (c: any) => c.cardType === "TEAM" && c.teamName === firstTeamName,
  );
  expect(teamCard).toBeDefined();

  // Codemaster gives clue
  await giveClue(request, cookie, gameId, 1, {
    word: "XYZZY",
    targetCardCount: 1,
    role: "CODEMASTER",
  });

  // Codebreaker makes guess
  const guessResult = await makeGuess(request, cookie, gameId, 1, {
    cardWord: teamCard.word,
    role: "CODEBREAKER",
  });

  expect(guessResult.guess.outcome).toBe("CORRECT_TEAM_CARD");
  expect(guessResult.guess.cardWord).toBe(teamCard.word);

  // Verify state
  const updated = await getGameState(request, cookie, gameId, { role: "CODEBREAKER" });
  const guessedCard = updated.currentRound.cards.find((c: any) => c.word === teamCard.word);
  expect(guessedCard.selected).toBe(true);
});

/**
 * Bystander guess via API returns correct outcome.
 */
test("bystander guess via API returns BYSTANDER_CARD", async ({ request }) => {
  const { gameId, cookie, gameState } = await setupGameViaApi(request);

  const bystanderCard = gameState.currentRound.cards.find((c: any) => c.cardType === "BYSTANDER");
  expect(bystanderCard).toBeDefined();

  await giveClue(request, cookie, gameId, 1, {
    word: "XYZZY",
    targetCardCount: 1,
    role: "CODEMASTER",
  });

  const result = await makeGuess(request, cookie, gameId, 1, {
    cardWord: bystanderCard.word,
    role: "CODEBREAKER",
  });

  expect(result.guess.outcome).toBe("BYSTANDER_CARD");
});
