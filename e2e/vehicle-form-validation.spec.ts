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

test.describe("vehicle form real-time validation", () => {
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
    await page.waitForLoadState("networkidle");
  });

  test("Add Vehicle: submit is disabled on a fresh empty form", async ({
    page,
  }) => {
    await page.goto("/dashboard/vehicles/new");
    await expect(
      page.getByRole("button", { name: /Add Vehicle/i }),
    ).toBeDisabled();
  });

  test("Add Vehicle: touching a required field and leaving it invalid shows an inline error and keeps submit disabled", async ({
    page,
  }) => {
    await page.goto("/dashboard/vehicles/new");

    const submitButton = page.getByRole("button", { name: /Add Vehicle/i });
    const makeInput = page.getByLabel("Make");

    // Touch Make (focus, then blur without typing) — required field, empty.
    await makeInput.focus();
    await page.getByLabel("Model").focus();

    await expect(page.getByText("Make is required.")).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Negative mileage: format/range error, not just "required".
    const mileageInput = page.getByLabel("Mileage");
    await mileageInput.fill("-5");
    await page.getByLabel("Model").focus();
    await expect(page.getByText("Mileage cannot be negative.")).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Out-of-range year.
    const yearInput = page.getByLabel("Year");
    await yearInput.fill("1899");
    await page.getByLabel("Model").focus();
    await expect(page.getByText(/Year must be between/i)).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Bad VIN format (wrong length).
    const vinInput = page.getByLabel("VIN");
    await vinInput.fill("TOOSHORT");
    await page.getByLabel("Model").focus();
    await expect(page.getByText("VIN must be 17 characters.")).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("Add Vehicle: filling all fields with valid values enables submit and creates the vehicle", async ({
    page,
  }) => {
    const stockNumber = uniqueStockNumber();
    const vin = uniqueVin();
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dashboard/vehicles/new");

    const submitButton = page.getByRole("button", { name: /Add Vehicle/i });
    await expect(submitButton).toBeDisabled();

    await page.getByLabel("VIN").fill(vin);
    await page.getByLabel("Stock #").fill(stockNumber);
    await page.getByLabel("Year").fill("2023");
    await page.getByLabel("Make").fill("Honda");
    await page.getByLabel("Model").fill("Civic");
    await page.getByLabel("Mileage").fill("1200");
    await page.getByLabel("Condition").selectOption("NEW");
    // Blur the last field so any lingering "touched" errors clear.
    await page.getByLabel("Notes").focus();

    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
    await expect(
      page.getByRole("heading", { name: /2023 Honda Civic/i }),
    ).toBeVisible();
    await expect(page.getByText(`Stock #${stockNumber}`)).toBeVisible();

    // No React "uncontrolled to controlled" (or similar) warnings from the
    // switch to controlled inputs in this fix.
    const reactWarnings = consoleErrors.filter((text) =>
      /uncontrolled|controlled/i.test(text),
    );
    expect(reactWarnings).toEqual([]);

    // Clean up: other specs (e.g. dashboard.spec.ts) assert exact row/KPI
    // counts against supabase/seed.sql, so anything created here must not
    // be left behind.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Delete/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("Edit Vehicle: existing values populate correctly and remain valid/submittable unchanged", async ({
    page,
  }) => {
    // Create a vehicle first via the API-less UI path so we have a known id.
    const stockNumber = uniqueStockNumber();
    const vin = uniqueVin();

    await page.goto("/dashboard/vehicles/new");
    await page.getByLabel("VIN").fill(vin);
    await page.getByLabel("Stock #").fill(stockNumber);
    await page.getByLabel("Year").fill("2021");
    await page.getByLabel("Make").fill("Ford");
    await page.getByLabel("Model").fill("Focus");
    await page.getByLabel("Mileage").fill("30000");
    await page.getByLabel("Condition").selectOption("USED");
    await page.getByRole("button", { name: /Add Vehicle/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/(\d+)$/);

    await page.getByRole("link", { name: /Edit/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+\/edit$/);

    // Prefilled values should populate the controlled fields.
    await expect(page.getByLabel("VIN")).toHaveValue(vin);
    await expect(page.getByLabel("Stock #")).toHaveValue(stockNumber);
    await expect(page.getByLabel("Year")).toHaveValue("2021");
    await expect(page.getByLabel("Make")).toHaveValue("Ford");
    await expect(page.getByLabel("Model")).toHaveValue("Focus");
    await expect(page.getByLabel("Mileage")).toHaveValue("30000");
    await expect(page.getByLabel("Condition")).toHaveValue("USED");

    // No inline errors should be showing for a prefilled, already-valid form.
    await expect(page.getByText("VIN must be 17 characters.")).toHaveCount(0);
    await expect(page.getByText("Make is required.")).toHaveCount(0);

    // Submit remains enabled/submittable without touching anything.
    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
    await expect(
      page.getByRole("heading", { name: /2021 Ford Focus/i }),
    ).toBeVisible();

    // Clean up: other specs (e.g. dashboard.spec.ts) assert exact row/KPI
    // counts against supabase/seed.sql, so anything created here must not
    // be left behind.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Delete/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
