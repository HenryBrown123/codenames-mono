import { test, expect } from "@playwright/test";
import { setupGameViaApi } from "./fixtures/game-helpers";
import { setAuthCookie, openDashboardIfMobile } from "./fixtures/dashboard-helpers";

/**
 * Dismiss the single-device handoff overlay if present.
 */
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
  await page.waitForTimeout(2000);

  /** The clue-word-input inside CompactDashboard should be auto-focused */
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? { id: el.id, tag: el.tagName } : null;
  });
  console.log("Focused element:", JSON.stringify(focused));

  expect(focused?.id).toBe("clue-word-input");

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
  await page.waitForTimeout(2000);

  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? { id: el.id, tag: el.tagName } : null;
  });
  console.log("Focused element (desktop):", JSON.stringify(focused));

  expect(focused?.id).toBe("clue-word-input");

  await ctx.close();
});
