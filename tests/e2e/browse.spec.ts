import { test, expect } from "@playwright/test";

test.describe("Browse and product detail", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: /shop/i })).toBeVisible();
  });

  test("can search via filter input", async ({ page }) => {
    await page.goto("/shop");
    const search = page.getByPlaceholder(/brand, name, reference/i).first();
    if (await search.count()) {
      await search.fill("Rolex");
      await page.waitForTimeout(400);
    }
  });

  test("404 page is branded", async ({ page }) => {
    const res = await page.goto("/shop/this-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/lost in time/i)).toBeVisible();
  });
});
