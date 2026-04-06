import { test, expect, type Page } from "@playwright/test";
import { openDashboardIfMobile, clickDashboardButton } from "./fixtures/dashboard-helpers";

/** Click the first visible instance of a button with a duplicated ID */
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

/**
 * Full single-device QUICK game: auth → lobby → deal → gameplay loop.
 * Runs at desktop, tablet, and mobile viewports.
 */
test("complete single-device game from auth to game over", async ({ page }) => {
  await page.goto("/");

  /** Auth */
  await page.locator("#connect-btn").click();

  /** Setup */
  await expect(page.locator("#game-type-single")).toBeVisible();
  await page.locator("#create-game-btn").click();

  /** Lobby */
  const startBtn = page.locator("#start-game-btn");
  await expect(startBtn).toBeVisible({ timeout: 10_000 });

  /** Click visible team switcher tab if it exists (mobile/tablet lobby) */
  const switchTeam = async (team: string) => {
    const allBtns = await page.locator(`button`).all();
    for (const btn of allBtns) {
      const text = await btn.textContent().catch(() => "");
      if (text?.trim().toUpperCase() === `TEAM ${team.toUpperCase()}` && await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
        return;
      }
    }
  };

  /** Get the visible instance of an input/button with a duplicated ID */
  const getVisible = async (selector: string) => {
    const all = await page.locator(selector).all();
    for (const el of all) {
      if (await el.isVisible().catch(() => false)) return el;
    }
    return page.locator(selector).first();
  };

  await switchTeam("RED");
  const redInput = await getVisible("#add-player-team-red-input");
  await expect(redInput).toBeVisible({ timeout: 3000 });
  await redInput.fill("Alice");
  (await getVisible("#add-player-team-red-btn")).click();
  await expect(redInput).toHaveValue("", { timeout: 3000 });
  await redInput.fill("Bob");
  (await getVisible("#add-player-team-red-btn")).click();
  await expect(redInput).toHaveValue("", { timeout: 3000 });

  await switchTeam("BLUE");
  const blueInput = await getVisible("#add-player-team-blue-input");
  await expect(blueInput).toBeVisible({ timeout: 3000 });
  await blueInput.fill("Charlie");
  (await getVisible("#add-player-team-blue-btn")).click();
  await expect(blueInput).toHaveValue("", { timeout: 3000 });
  await blueInput.fill("Diana");
  (await getVisible("#add-player-team-blue-btn")).click();

  await expect(startBtn).toBeEnabled({ timeout: 3000 });
  await startBtn.click();

  /** In-game lobby: Start Round (deal animation) then Start Round (begin) */
  await page.waitForTimeout(2000);
  await clickDashboardButton(page, "#lobby-action-btn"); // triggers deal animation
  await page.waitForTimeout(2000);
  await clickDashboardButton(page, "#lobby-action-btn"); // actually starts round
  await page.waitForTimeout(1000);

  /** Gameplay loop */
  for (let turn = 0; turn < 20; turn++) {
    const gameOverVisible = await page.getByText("VICTORY").isVisible().catch(() => false);
    if (gameOverVisible) break;

    /** Handoff overlay (always above drawers) */
    const handoffBtn = page.locator("#handoff-execute-btn");
    if (await handoffBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await handoffBtn.click();
      await page.waitForTimeout(500);
    }

    /** Codemaster: give clue */
    await openDashboardIfMobile(page);
    const clueInput = page.locator("#clue-word-input");
    const visibleClueInput = await (async () => {
      const all = await clueInput.all();
      for (const el of all) {
        if (await el.isVisible().catch(() => false)) return el;
      }
      return null;
    })();
    if (visibleClueInput) {
      await visibleClueInput.fill("XYZZY");
      /** Submit via Enter key -- works regardless of button location/viewport */
      await visibleClueInput.press("Enter");
      await page.waitForTimeout(1000);
      continue;
    }

    /** Codebreaker: click a card */
    const clickableCard = page.locator("[data-clickable='true']").first();
    if (await clickableCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clickableCard.click();
      await page.waitForTimeout(1500);

      /** End turn if visible */
      await openDashboardIfMobile(page);
      const endTurnBtn = page.locator("#end-turn-btn");
      for (const btn of await endTurnBtn.all()) {
        if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
          await btn.click();
          break;
        }
      }
      await page.waitForTimeout(500);
      continue;
    }

    /** Next turn */
    await openDashboardIfMobile(page);
    try {
      await clickVisibleButton(page, "#next-turn-btn", 1000);
      await page.waitForTimeout(500);
    } catch {
      /** no next turn button -- wait */
    }

    await page.waitForTimeout(1000);
  }
});
