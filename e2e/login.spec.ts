import { test, expect } from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

function disposableEmail() {
  return `qa-smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("route protection", () => {
  test("unauthenticated root redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unauthenticated /dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("signup", () => {
  test("submitting the signup form succeeds, asks for confirmation, or hits Supabase's rate limit", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(disposableEmail());
    await page.getByLabel("Password").fill("Qa-Smoke-Test-1234");
    await page.getByRole("button", { name: /Create account/i }).click();

    // Race the three mutually-exclusive outcomes rather than checking each
    // in sequence — a redirect to /dashboard means the signup/confirmation
    // text never renders at all, so a sequential check would hang on it.
    const outcome = await Promise.race([
      page
        .waitForURL(/\/dashboard$/, { timeout: 8000 })
        .then(() => "dashboard" as const)
        .catch(() => null),
      page
        .getByText(/Too many attempts/i)
        .waitFor({ timeout: 8000 })
        .then(() => "rate-limited" as const)
        .catch(() => null),
      page
        .getByText(/Check your email to confirm|Account created successfully/i)
        .waitFor({ timeout: 8000 })
        .then(() => "confirmation" as const)
        .catch(() => null),
    ]);

    test.skip(
      outcome === "rate-limited",
      "Supabase's signup email rate limit was hit — not a code issue, retry later",
    );

    expect(outcome, "expected dashboard redirect or confirmation message").not
      .toBeNull();
  });

  test("shows an error for an invalid signup submission", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /Create account/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });
});

test.describe("login / dashboard / logout", () => {
  test.skip(
    !QA_TEST_EMAIL || !QA_TEST_PASSWORD,
    "QA_TEST_EMAIL / QA_TEST_PASSWORD are not set — see .env.local",
  );

  test("rejects an incorrect password", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(QA_TEST_EMAIL!);
    await page.getByLabel("Password").fill("definitely-wrong-password");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs in, reaches the dashboard, and logs out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(QA_TEST_EMAIL!);
    await page.getByLabel("Password").fill(QA_TEST_PASSWORD!);
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(QA_TEST_EMAIL!)).toBeVisible();

    // An authenticated session should bounce away from /login and root.
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: /Log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);

    // Session should really be gone now.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
