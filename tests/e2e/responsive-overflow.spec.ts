import { expect, test, type Page } from "@playwright/test";

const publicRoutes = ["/", "/projects", "/login"] as const;
const protectedRoutes = ["/dashboard", "/gio_dash"] as const;
const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1600, height: 1000 },
] as const;

type OverflowMetric = {
  route: string;
  width: number;
  height: number;
  scrollWidth: number;
  clientWidth: number;
  bodyScrollWidth: number;
  bodyClientWidth: number;
};

async function getOverflowMetric(page: Page, route: string, width: number, height: number): Promise<OverflowMetric> {
  return page.evaluate(
    ({ route, width, height }) => ({
      route,
      width,
      height,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
    }),
    { route, width, height },
  );
}

async function getOverflowOffenders(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          left: rect.left,
          right: rect.right,
          width: rect.width,
        };
      })
      .filter(
        (item) =>
          item.right > document.documentElement.clientWidth + 1 ||
          item.left < -1,
      )
      .slice(0, 8),
  );
}

async function assertNoOverflow(page: Page, metric: OverflowMetric) {
  const offenders = await getOverflowOffenders(page);
  expect(
    metric.scrollWidth,
    JSON.stringify({ metric, offenders }, null, 2),
  ).toBeLessThanOrEqual(metric.clientWidth);
  expect(
    metric.bodyScrollWidth,
    JSON.stringify({ metric, offenders }, null, 2),
  ).toBeLessThanOrEqual(metric.bodyClientWidth);
}

async function assertPrincipalTargets(page: Page) {
  const smallTargets = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-slot='button'], form button[type='submit']"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 80) ?? "",
          ariaLabel: element.getAttribute("aria-label"),
          width: rect.width,
          height: rect.height,
        };
      })
      .filter((item) => item.width < 44 || item.height < 44)
      .slice(0, 5),
  );

  expect(smallTargets, JSON.stringify(smallTargets, null, 2)).toEqual([]);
}

test.describe("responsive overflow", () => {
  for (const route of publicRoutes) {
    for (const viewport of viewports) {
      test(`${route} has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route, { waitUntil: "networkidle" });

        const metric = await getOverflowMetric(page, route, viewport.width, viewport.height);
        console.log(`OVERFLOW_METRIC ${JSON.stringify(metric)}`);
        await assertNoOverflow(page, metric);
        await assertPrincipalTargets(page);

        const themeToggle = page.getByRole("button", { name: /Switch to (light|dark) mode|Toggle color theme/i });
        await expect(themeToggle.first()).toBeVisible();

        if (route !== "/login") {
          if (viewport.width < 768) {
            await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
          } else {
            await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
          }
        }
      });
    }
  }

  for (const route of protectedRoutes) {
    for (const viewport of viewports) {
      test(`${route} redirects unauthenticated users at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
        console.log(`AUTH_REDIRECT ${JSON.stringify({ route, width: viewport.width, redirectedTo: "/login" })}`);
      });
    }
  }
});

test.describe("first visit theme behavior", () => {
  test("system light is used on first visit, then explicit dark persists", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto("/");

    await expect.poll(() => page.evaluate(() => document.documentElement.className)).toContain("light");

    await page.getByRole("button", { name: /Switch to dark mode/i }).first().click();
    await expect.poll(() => page.evaluate(() => document.documentElement.className)).toContain("dark");

    const secondPage = await context.newPage();
    await secondPage.goto("/");
    await expect.poll(() => secondPage.evaluate(() => document.documentElement.className)).toContain("dark");
    await context.close();
  });

  test("system dark is used on first visit, then explicit light persists", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");

    await expect.poll(() => page.evaluate(() => document.documentElement.className)).toContain("dark");

    await page.getByRole("button", { name: /Switch to light mode/i }).first().click();
    await expect.poll(() => page.evaluate(() => document.documentElement.className)).toContain("light");

    const secondPage = await context.newPage();
    await secondPage.goto("/");
    await expect.poll(() => secondPage.evaluate(() => document.documentElement.className)).toContain("light");
    await context.close();
  });
});
