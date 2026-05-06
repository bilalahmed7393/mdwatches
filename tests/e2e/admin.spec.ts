import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText(/MD WATCHES/)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
