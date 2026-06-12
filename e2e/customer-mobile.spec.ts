import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "crumbstall-e2e-auth-bypass",
      value: "true",
      url: "http://localhost:3000",
    },
  ]);

  await page.setViewportSize({ width: 390, height: 844 });

  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          name: "Mobile Customer",
          email: "mobile.customer@crumbstall.test",
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

test("mobile menu layout keeps primary ordering controls visible", async ({ page }) => {
  await page.goto("/menu");

  await expect(page.getByRole("heading", { name: /fresh food/i })).toBeVisible();
  await expect(page.getByPlaceholder(/search burger/i)).toBeVisible();
  await expect(page.getByRole("navigation").last()).toBeVisible();
  await expect(page.getByRole("link", { name: /cart/i })).toBeVisible();

  await assertNoHorizontalOverflow(page);
});

test("mobile cart and checkout summaries fit the viewport", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /browse menu/i }).first()).toBeVisible();
  await assertNoHorizontalOverflow(page);

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: /pickup and payment/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^asap/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /back to menu/i })).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    widestElements: Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          className: element.getAttribute("class"),
          text: element.textContent?.trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((entry) => entry.right > document.documentElement.clientWidth + 1)
      .slice(0, 5),
  }));

  expect(
    overflow.scrollWidth,
    JSON.stringify(overflow.widestElements, null, 2),
  ).toBeLessThanOrEqual(overflow.viewportWidth + 1);
}
