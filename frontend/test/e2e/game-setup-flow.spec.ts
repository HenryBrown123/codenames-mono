import { test, expect, type Page } from "@playwright/test";
import { clickDashboardButton, authInBrowser, setAuthCookie } from "./fixtures/dashboard-helpers";
import { setupGameViaApi } from "./fixtures/game-helpers";

/** Helper to click the visible instance of a duplicated-ID button */
async function clickVisibleButton(page: Page, selector: string, timeout = 5000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const allBtns = await page.locator(selector).all();
    for (const btn of allBtns) {
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        return;
      }
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`No visible button found for ${selector} within ${timeout}ms`);
}

/** On mobile lobby, only one team is visible — switch via tab */
async function switchToTeamIfMobile(page: Page, teamName: "Team Red" | "Team Blue") {
  const label = teamName === "Team Red" ? "TEAM RED" : "TEAM BLUE";
  const switcher = page.getByRole("button", { name: label, exact: true });
  if (await switcher.isVisible({ timeout: 500 }).catch(() => false)) {
    await switcher.click();
    await page.waitForTimeout(300);
  }
}

/** Get the visible instance of an element with a duplicated ID */
async function getVisible(page: Page, selector: string) {
  const all = await page.locator(selector).all();
  for (const el of all) {
    if (await el.isVisible().catch(() => false)) return el;
  }
  return page.locator(selector).first();
}

/**
 * Full setup flow: auth → game settings → lobby → deal → redeal → start round.
 *
 * After the lobby START button:
 *   1. Round is auto-created and cards auto-dealt (hidden until animation)
 *   2. "Start Round" button visible in stacked dashboard → click to trigger deal animation
 *   3. "REDEAL CARDS" button appears → can redeal
 *   4. "Start Round" again → starts gameplay (handoff overlay appears)
 */
test("single-device setup: auth → settings → lobby → deal → redeal → start", async ({ page }) => {
  await page.goto("/");

  /** Auth */
  await page.locator("#connect-btn").click();

  /** Game settings */
  await expect(page.locator("#game-type-single")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#game-type-single")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#game-type-multi")).toHaveAttribute("aria-pressed", "false");

  /** Toggle types and back */
  await page.locator("#game-type-multi").click();
  await expect(page.locator("#game-type-multi")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#game-type-single").click();
  await expect(page.locator("#game-type-single")).toHaveAttribute("aria-pressed", "true");

  await page.locator("#create-game-btn").click();

  /** Lobby -- add players */
  await expect(page.locator("#start-game-btn")).toBeVisible({ timeout: 10_000 });

  await switchToTeamIfMobile(page, "Team Red");
  const redInput = await getVisible(page, "#add-player-team-red-input");
  await expect(redInput).toBeVisible({ timeout: 3000 });
  await redInput.fill("Alice");
  (await getVisible(page, "#add-player-team-red-btn")).click();
  await expect(redInput).toHaveValue("", { timeout: 3000 });

  await redInput.fill("Bob");
  (await getVisible(page, "#add-player-team-red-btn")).click();
  await expect(redInput).toHaveValue("", { timeout: 3000 });

  await switchToTeamIfMobile(page, "Team Blue");
  const blueInput = await getVisible(page, "#add-player-team-blue-input");
  await expect(blueInput).toBeVisible({ timeout: 3000 });
  await blueInput.fill("Charlie");
  (await getVisible(page, "#add-player-team-blue-btn")).click();
  await expect(blueInput).toHaveValue("", { timeout: 3000 });

  await blueInput.fill("Diana");
  (await getVisible(page, "#add-player-team-blue-btn")).click();
  await expect(blueInput).toHaveValue("", { timeout: 3000 });

  /** Start game */
  const startBtn = page.locator("#start-game-btn");
  await expect(startBtn).toBeEnabled({ timeout: 3000 });
  await startBtn.click();

  /** Click "Start Round" to trigger deal animation */
  await page.waitForTimeout(2000);
  await clickVisibleButton(page, "#lobby-action-btn");
  await page.waitForTimeout(2000);

  /** Verify 25 cards dealt */
  const cards = page.locator("[aria-label][data-team]");
  await expect(cards.first()).toBeVisible({ timeout: 5000 });
  expect(await cards.count()).toBe(25);

  /** REDEAL */
  await clickVisibleButton(page, "#redeal-btn");
  await page.waitForTimeout(3000);

  /** Still 25 cards after redeal */
  expect(await cards.count()).toBe(25);

  /** Start Round (actually starts gameplay) */
  await clickVisibleButton(page, "#lobby-action-btn");
  await page.waitForTimeout(2000);

  /** Verify gameplay started -- handoff overlay should appear */
  await expect(page.locator("#handoff-execute-btn")).toBeVisible({ timeout: 10_000 });
});

/**
 * Multi-device: two contexts view the same game after API setup.
 */
test("multi-device setup: two contexts view the same game", async ({ browser, request }) => {
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

  /**
   * Multiple board layouts render simultaneously (CSS hides one),
   * so count may be 25 or 50. Just verify at least 25 cards exist.
   */
  expect(await cardsA.count()).toBeGreaterThanOrEqual(25);
  expect(await cardsB.count()).toBeGreaterThanOrEqual(25);

  await ctxA.close();
  await ctxB.close();
});

/**
 * Lobby validation: START button disabled with insufficient players.
 */
test("start button disabled until enough players", async ({ page }) => {
  await page.goto("/");

  await page.locator("#connect-btn").click();
  await expect(page.locator("#create-game-btn")).toBeVisible({ timeout: 5000 });
  await page.locator("#create-game-btn").click();

  const startBtn = page.locator("#start-game-btn");
  await expect(startBtn).toBeVisible({ timeout: 10_000 });
  await expect(startBtn).toBeDisabled();

  /** 1 red player -- not enough */
  await switchToTeamIfMobile(page, "Team Red");
  const redInput2 = await getVisible(page, "#add-player-team-red-input");
  await redInput2.fill("Alice");
  (await getVisible(page, "#add-player-team-red-btn")).click();
  await expect(redInput2).toHaveValue("", { timeout: 3000 });
  await expect(startBtn).toBeDisabled();

  /** 2nd red */
  await redInput2.fill("Bob");
  (await getVisible(page, "#add-player-team-red-btn")).click();
  await expect(redInput2).toHaveValue("", { timeout: 3000 });

  /** 2 blue */
  await switchToTeamIfMobile(page, "Team Blue");
  const blueInput2 = await getVisible(page, "#add-player-team-blue-input");
  await blueInput2.fill("Charlie");
  (await getVisible(page, "#add-player-team-blue-btn")).click();
  await expect(blueInput2).toHaveValue("", { timeout: 3000 });
  await blueInput2.fill("Diana");
  (await getVisible(page, "#add-player-team-blue-btn")).click();

  await expect(startBtn).toBeEnabled({ timeout: 5000 });
});
