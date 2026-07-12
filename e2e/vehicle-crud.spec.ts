import { test, expect } from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

// stock_number is a varchar(20) column, so keep the generated value well
// under that limit (a "QA-" prefix + base36 timestamp + short random tail).
function uniqueStockNumber() {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 5);
  return `QA-${time}-${rand}`;
}

// VIN must be exactly 17 chars. Build one from a fixed prefix + a
// timestamp-derived tail so each run is unique but always 17 characters.
function uniqueVin() {
  const tail = Date.now().toString(36).toUpperCase().padStart(9, "0").slice(-9);
  return `1QAVIN${tail}`.slice(0, 17).padEnd(17, "0");
}

test.describe("vehicle inventory CRUD", () => {
  test.skip(
    !QA_TEST_EMAIL || !QA_TEST_PASSWORD,
    "QA_TEST_EMAIL / QA_TEST_PASSWORD are not set — see .env.local",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(QA_TEST_EMAIL!);
    await page.getByLabel("Password").fill(QA_TEST_PASSWORD!);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // See e2e/dashboard.spec.ts: wait for hydration before interacting with
    // client components on a page that arrived via a full-page redirect.
    await page.waitForLoadState("networkidle");
  });

  test("golden path: create, edit, and delete a vehicle", async ({ page }) => {
    const stockNumber = uniqueStockNumber();
    const vin = uniqueVin();

    await page.getByRole("link", { name: /Add Vehicle/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new$/);

    await page.getByLabel("VIN").fill(vin);
    await page.getByLabel("Stock #").fill(stockNumber);
    await page.getByLabel("Year").fill("2022");
    await page.getByLabel("Make").fill("Toyota");
    await page.getByLabel("Model").fill("Camry");
    await page.getByLabel("Mileage").fill("15000");
    await page.getByLabel("Condition").selectOption("USED");

    await page.getByRole("button", { name: /Add Vehicle/i }).click();

    // Should land on the detail page for the new vehicle.
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
    await expect(
      page.getByRole("heading", { name: /2022 Toyota Camry/i }),
    ).toBeVisible();
    await expect(page.getByText(`Stock #${stockNumber}`)).toBeVisible();
    await expect(page.getByText(vin)).toBeVisible();

    // Edit: change the model and mileage, confirm the change is reflected.
    await page.getByRole("link", { name: /Edit/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+\/edit$/);

    await page.getByLabel("Model").fill("Corolla");
    await page.getByLabel("Mileage").fill("20000");
    await page.getByRole("button", { name: /Save Changes/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
    await expect(
      page.getByRole("heading", { name: /2022 Toyota Corolla/i }),
    ).toBeVisible();
    await expect(page.getByText("20,000")).toBeVisible();

    // Delete: confirm() the dialog, land back on the dashboard, vehicle gone.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Delete/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(stockNumber)).not.toBeVisible();
  });

  test("shows a friendly validation error for a too-short VIN and does not navigate away", async ({
    page,
  }) => {
    const stockNumber = uniqueStockNumber();

    await page.getByRole("link", { name: /Add Vehicle/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new$/);

    await page.getByLabel("VIN").fill("SHORTVIN123");
    await page.getByLabel("Stock #").fill(stockNumber);
    await page.getByLabel("Year").fill("2022");
    await page.getByLabel("Make").fill("Toyota");
    await page.getByLabel("Model").fill("Camry");
    await page.getByLabel("Mileage").fill("15000");
    await page.getByLabel("Condition").selectOption("USED");

    await page.getByRole("button", { name: /Add Vehicle/i }).click();

    // The form's own error <p role="alert"> is distinct from Next.js's route
    // announcer, which also carries role="alert" for accessibility.
    await expect(page.getByText("VIN must be 17 characters.")).toBeVisible();
    // Form submission failed validation server-side: stay on the create page.
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new$/);
  });

  test("visiting a nonexistent vehicle id renders a 404", async ({ page }) => {
    const response = await page.goto("/dashboard/vehicles/999999999");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});
