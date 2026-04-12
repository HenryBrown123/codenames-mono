import { test, expect } from "@playwright/test";
import { setupGameViaApi } from "./fixtures/game-helpers";
import { setAuthCookie, openDashboardIfMobile } from "./fixtures/dashboard-helpers";

async function dismissHandoff(page: import("@playwright/test").Page) {
  const handoff = page.locator("#handoff-execute-btn");
  if (await handoff.isVisible({ timeout: 3000 }).catch(() => false)) {
    await handoff.click();
    await page.waitForTimeout(500);
  }
}

test("windowed — clue input auto-focuses on codemaster turn", async ({
  browser,
  request,
}) => {
  const { gameId, cookie } = await setupGameViaApi(request);
  const token = cookie.replace("authToken=", "");

  const ctx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  });
  await setAuthCookie(ctx, token);
  const page = await ctx.newPage();
  await page.goto(`/game/${gameId}?role=CODEMASTER`);
  await dismissHandoff(page);

  // Activate the page (headless windows aren't focused by default)
  await page.locator("body").click();
  await page.waitForTimeout(500);

  await expect(page.locator("#clue-word-input")).toHaveFocus({ timeout: 5000 });

  await ctx.close();
});

test("desktop — clue input auto-focuses on codemaster turn", async ({
  browser,
  request,
}) => {
  const { gameId, cookie } = await setupGameViaApi(request);
  const token = cookie.replace("authToken=", "");

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  await setAuthCookie(ctx, token);
  const page = await ctx.newPage();
  await page.goto(`/game/${gameId}?role=CODEMASTER`);
  await dismissHandoff(page);

  // Activate the page (headless windows aren't focused by default)
  await page.locator("body").click();
  await page.waitForTimeout(500);

  await expect(page.locator("#clue-word-input")).toHaveFocus({ timeout: 5000 });

  await ctx.close();
});
