import { expect, test, type Page } from "@playwright/test";

const orderNumber = "CS-E2E-CHECKOUT";
const customerSession = {
  user: {
    name: "E2E Customer",
    email: "customer.e2e@crumbstall.test",
    image: null,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

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
      body: JSON.stringify(customerSession),
    });
  });

  await page.route("**/api/cart", async (route) => {
    const request = route.request();

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: request.method() === "GET" ? [] : undefined,
        updatedAt: new Date("2026-06-07T10:00:00.000Z").toISOString(),
      }),
    });
  });

  await page.route("**/api/recommendations/foods?limit=4", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], meta: { personalized: false } }),
    });
  });

  await page.route("**/api/favorites", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ slugs: [] }),
    });
  });

  await page.route("**/api/checkout/start", async (route) => {
    const payload = JSON.parse(route.request().postData() ?? "{}") as {
      items?: Array<{ foodItemId: string; quantity: number }>;
      pickupSlot?: { id: string };
      checkoutAttemptId?: string;
    };

    expect(payload.items?.[0]).toEqual(
      expect.objectContaining({
        slug: "classic-veg-burger",
        quantity: 1,
      }),
    );
    expect(payload.pickupSlot?.id).toBe("asap");
    expect(payload.checkoutAttemptId).toBeTruthy();

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "order-e2e-pending",
        orderNumber,
        status: "PENDING_PAYMENT",
        subtotalAmount: 79,
        taxAmount: 4,
        discountAmount: 0,
        totalAmount: 83,
        razorpay: {
          mode: "mock",
          keyId: "rzp_test_e2e",
          orderId: "order_e2e_checkout",
          amount: 8300,
          currency: "INR",
          receipt: orderNumber,
        },
      }),
    });
  });

  await page.route("**/api/checkout/confirm", async (route) => {
    const payload = JSON.parse(route.request().postData() ?? "{}") as {
      orderNumber?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
    };

    expect(payload.orderNumber).toBe(orderNumber);
    expect(payload.razorpayOrderId).toBe("order_e2e_checkout");
    expect(payload.razorpayPaymentId).toContain("pay_mock_");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "order-e2e-created",
        orderNumber,
        status: "PLACED",
        subtotalAmount: 79,
        taxAmount: 4,
        discountAmount: 0,
        totalAmount: 83,
        paymentId: "payment-e2e",
      }),
    });
  });
});

test("customer can add a menu item and complete mock checkout", async ({ page }) => {
  await resetBrowserStorage(page);

  await page.goto("/menu");
  await expect(page.getByRole("heading", { name: /fresh food/i })).toBeVisible();

  await page
    .locator("article", { hasText: "Classic Veg Burger" })
    .getByRole("button", { name: /^add$/i })
    .first()
    .click();

  await expect(page.getByRole("link", { name: /1 item added/i })).toBeVisible();
  await page.goto("/checkout");

  await expect(page.getByRole("heading", { name: /pickup and payment/i })).toBeVisible();
  await page.getByRole("button", { name: /^asap/i }).click();

  await page.getByRole("button", { name: /pay with razorpay/i }).click();

  await expect(page).toHaveURL(new RegExp(`/orders/${orderNumber}$`));
});

async function resetBrowserStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}
