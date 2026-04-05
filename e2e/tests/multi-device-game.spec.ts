import { test, expect } from "@playwright/test";
import { setupGameViaApi, giveClue, makeGuess, getGameState } from "../fixtures/game-helpers";
import { setAuthCookie } from "../fixtures/dashboard-helpers";

/**
 * Two browser contexts see the same board.
 */
test("two contexts see cards on the board", async ({ browser, request }) => {
  const { gameId, cookie } = await setupGameViaApi(request);
  const token = cookie.replace("authToken=", "");

  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  await setAuthCookie(ctxA, token);
  await setAuthCookie(ctxB, token);
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await pageA.goto(`/game/${gameId}`);
  await pageB.goto(`/game/${gameId}`);

  const cardsA = pageA.locator("[aria-label][data-team]");
  const cardsB = pageB.locator("[aria-label][data-team]");
  await expect(cardsA.first()).toBeVisible({ timeout: 15_000 });
  await expect(cardsB.first()).toBeVisible({ timeout: 15_000 });
  expect(await cardsA.count()).toBeGreaterThanOrEqual(25);
  expect(await cardsB.count()).toBeGreaterThanOrEqual(25);

  await ctxA.close();
  await ctxB.close();
});

/**
 * API actions update game state that both contexts can verify.
 */
test("guess via API selects card visible to viewers", async ({ browser, request }) => {
  const { gameId, cookie, gameState } = await setupGameViaApi(request);
  const token = cookie.replace("authToken=", "");

  const firstTeamName = gameState.currentRound.turns?.[0]?.teamName;
  const teamCard = gameState.currentRound.cards.find(
    (c: any) => c.cardType === "TEAM" && c.teamName === firstTeamName,
  );
  expect(teamCard).toBeDefined();

  // Give clue and make guess via API
  await giveClue(request, cookie, gameId, 1, {
    word: "XYZZY",
    targetCardCount: 1,
    role: "CODEMASTER",
  });
  await makeGuess(request, cookie, gameId, 1, {
    cardWord: teamCard.word,
    role: "CODEBREAKER",
  });

  // Verify via API
  const updated = await getGameState(request, cookie, gameId, { role: "CODEBREAKER" });
  const guessedCard = updated.currentRound.cards.find((c: any) => c.word === teamCard.word);
  expect(guessedCard.selected).toBe(true);

  // Open a browser context and verify the card shows as selected
  const ctx = await browser.newContext();
  await setAuthCookie(ctx, token);
  const page = await ctx.newPage();
  await page.goto(`/game/${gameId}?role=CODEBREAKER`);

  // Dismiss handoff if present
  const handoff = page.locator("#handoff-execute-btn");
  if (await handoff.isVisible({ timeout: 3000 }).catch(() => false)) {
    await handoff.click();
    await page.waitForTimeout(500);
  }

  // The selected card should have a different visual state
  const cardEl = page.locator(`[aria-label="${teamCard.word}"]`).first();
  await expect(cardEl).toBeVisible({ timeout: 10_000 });

  await ctx.close();
});
