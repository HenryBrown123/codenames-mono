import { type Page, type BrowserContext, expect } from "@playwright/test";

/**
 * Display type breakpoints matching the frontend logic in display-type.ts:
 *   desktop:  w >= 1000 && h >= 800 && landscape
 *   windowed: h >= 700
 *   mobile:   everything else
 */

type DisplayType = "desktop" | "windowed" | "mobile";

export function getDisplayType(viewport: { width: number; height: number }): DisplayType {
  const { width: w, height: h } = viewport;
  if (w >= 1000 && h >= 800 && w > h) return "desktop";
  if (h >= 700) return "windowed";
  return "mobile";
}

/**
 * On mobile, the compact dashboard is inside a drawer that must be opened
 * before interacting with buttons. This helper opens the drawer if needed.
 *
 * Portrait mobile: click the swipe-up handle at the bottom
 * Landscape mobile: click the toggle tab on the left
 */
export async function openDashboardIfMobile(page: Page): Promise<void> {
  const vp = page.viewportSize();
  if (!vp) return;

  const display = getDisplayType(vp);
  if (display !== "mobile") return;

  const isPortrait = vp.height > vp.width;

  if (isPortrait) {
    /** Open portrait drawer via the handle button */
    const handle = page.locator("[aria-label='Open dashboard']");
    if (await handle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await handle.click();
      await page.waitForTimeout(400); // drawer animation
    }
  } else {
    /** Open landscape overlay via the toggle tab */
    const tab = page.locator("[aria-label='Toggle dashboard']");
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isOpen = await tab.getAttribute("data-open");
      if (isOpen !== "true") {
        await tab.click();
        await page.waitForTimeout(400);
      }
    }
  }
}

/**
 * Authenticate in a browser page by visiting the app root and clicking CONNECT.
 * The auth cookie persists for subsequent navigations in the same context.
 */
export async function authInBrowser(page: Page): Promise<void> {
  await page.goto("/");
  await page.locator("#connect-btn").click();
  await expect(page.locator("#create-game-btn")).toBeVisible({ timeout: 5000 });
}

/**
 * Set an API-created auth token as a browser cookie so the browser page
 * uses the same user identity as the API helper.
 */
export async function setAuthCookie(context: BrowserContext, token: string): Promise<void> {
  await context.addCookies([{
    name: "authToken",
    value: token,
    domain: "localhost",
    path: "/",
  }]);
}

/**
 * Click a button that may be inside the mobile dashboard drawer.
 * Opens the drawer first if on a mobile viewport.
 */
export async function clickDashboardButton(page: Page, selector: string): Promise<void> {
  await openDashboardIfMobile(page);
  /**
   * Multiple dashboard layouts may render simultaneously (CSS hides one),
   * so filter to the visible instance.
   * Multiple layouts render simultaneously (CSS hides one, or one is
   * outside the viewport). Try each instance -- click the one in viewport.
   */
  const allBtns = page.locator(selector);
  const count = await allBtns.count();

  /**
   * Try each, last-to-first (compact dashboard is later in DOM and more
   * likely to be in-viewport on tablet/mobile).
   */
  for (let i = count - 1; i >= 0; i--) {
    const btn = allBtns.nth(i);
    const visible = await btn.isVisible({ timeout: 500 }).catch(() => false);
    if (!visible) continue;

    const inViewport = await btn.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 &&
        rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    }).catch(() => false);

    if (inViewport) {
      await btn.click();
      return;
    }
  }

  /** Last resort: find any visible one, scroll it in, and force click */
  for (let i = count - 1; i >= 0; i--) {
    const btn = allBtns.nth(i);
    if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ force: true });
      return;
    }
  }

  throw new Error(`No clickable button found for ${selector}`);
}
