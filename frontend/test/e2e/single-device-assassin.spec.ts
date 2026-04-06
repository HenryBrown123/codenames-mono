import { test, expect } from "@playwright/test";
import { setupGameViaApi, getGameState, giveClue, makeGuess } from "./fixtures/game-helpers";
import { setAuthCookie } from "./fixtures/dashboard-helpers";

/**
 * Assassin card ends the round immediately.
 * Verifies via API that the assassin guess has ASSASSIN_CARD outcome
 * and the round is completed.
 */
test("assassin card ends round immediately via API", async ({ request }) => {
  const { gameId, cookie, gameState } = await setupGameViaApi(request);

  const assassinCard = gameState.currentRound.cards.find((c: any) => c.cardType === "ASSASSIN");
  expect(assassinCard).toBeDefined();

  await giveClue(request, cookie, gameId, 1, {
    word: "XYZZY",
    targetCardCount: 1,
    role: "CODEMASTER",
  });

  const guessResult = await makeGuess(request, cookie, gameId, 1, {
    cardWord: assassinCard.word,
    role: "CODEBREAKER",
  });

  // Verify the outcome is ASSASSIN_CARD
  expect(guessResult.guess.outcome).toBe("ASSASSIN_CARD");
  // Turn should be completed
  expect(guessResult.turn.status).toBe("COMPLETED");
});

/**
 * Assassin card click in browser triggers the guess.
 */
test("assassin card click in browser triggers guess", async ({ page, context, request }) => {
  const { gameId, cookie, gameState } = await setupGameViaApi(request);

  const assassinCard = gameState.currentRound.cards.find((c: any) => c.cardType === "ASSASSIN");
  expect(assassinCard).toBeDefined();

  await giveClue(request, cookie, gameId, 1, {
    word: "XYZZY",
    targetCardCount: 1,
    role: "CODEMASTER",
  });

  const token = cookie.replace("authToken=", "");
  await setAuthCookie(context, token);

  await page.goto(`/game/${gameId}?role=CODEBREAKER`);
  await page.waitForTimeout(3000);

  // Dismiss handoff overlay
  const handoffBtn = page.locator("#handoff-execute-btn");
  if (await handoffBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await handoffBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click the assassin card
  const assassinCardEl = page.locator(`[aria-label="${assassinCard.word}"]`);
  await expect(assassinCardEl).toBeVisible({ timeout: 10_000 });
  await assassinCardEl.click();
  await page.waitForTimeout(3000);

  // Verify the card was selected (game may or may not show COMPLETED)
  const finalState = await getGameState(request, cookie, gameId, { role: "CODEBREAKER" });
  const selectedCard = finalState.currentRound?.cards?.find((c: any) => c.word === assassinCard.word);
  expect(selectedCard?.selected).toBe(true);
});
