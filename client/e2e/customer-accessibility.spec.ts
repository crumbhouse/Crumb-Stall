import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "crumbstall-e2e-auth-bypass",
      value: "true",
      url: "http://localhost:3000",
    },
  ]);

  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          name: "A11y Customer",
          email: "a11y.customer@crumbstall.test",
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    });
  });

  await page.route("**/api/cart", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        updatedAt: "2026-06-07T10:00:00.000Z",
      }),
    });
  });

  await page.route("**/api/favorites", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ slugs: [] }),
    });
  });

  await page.route("**/api/recommendations/foods?limit=4", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], meta: { personalized: false } }),
    });
  });
});

test.describe("customer accessibility", () => {
  for (const path of ["/menu", "/cart", "/checkout"]) {
    test(`${path} has no detectable WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await assertNoA11yViolations(page);
    });
  }
});

async function assertNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}
