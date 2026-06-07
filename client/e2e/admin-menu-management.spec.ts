import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "crumbstall-e2e-auth-bypass",
      value: "true",
      url: "http://localhost:3000",
    },
  ]);

  await page.route("**/api/admin/categories", async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      const payload = JSON.parse(request.postData() ?? "{}") as {
        name?: string;
        slug?: string;
        description?: string;
        sortOrder?: number;
      };

      expect(payload).toEqual(
        expect.objectContaining({
          name: "E2E Snacks",
          slug: "e2e-snacks",
          description: "Created by Playwright",
          sortOrder: 7,
        }),
      );

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "cat-e2e-snacks",
          name: "E2E Snacks",
          slug: "e2e-snacks",
          description: "Created by Playwright",
          imageUrl: null,
          sortOrder: 7,
          isActive: true,
          foodItemCount: 0,
          createdAt: "2026-06-07T10:00:00.000Z",
          updatedAt: "2026-06-07T10:00:00.000Z",
        }),
      });
      return;
    }

    await route.continue();
  });
});

test("admin can create a menu category from menu management", async ({ page }) => {
  await page.goto("/admin/menu");

  await expect(page.getByRole("heading", { name: /menu management/i })).toBeVisible();

  await page.getByRole("button", { name: /add category/i }).click();
  await expect(page.getByRole("heading", { name: /add menu group/i })).toBeVisible();

  await page.getByLabel("Name").fill("E2E Snacks");
  await page.getByLabel("Slug").fill("e2e-snacks");
  await page.getByLabel("Description").fill("Created by Playwright");
  await page.getByLabel("Sort order").fill("7");
  await page.getByRole("button", { name: /create category/i }).click();

  await expect(page.getByText("Category created")).toBeVisible();
});
