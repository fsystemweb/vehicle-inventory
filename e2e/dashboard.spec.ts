import { test, expect } from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

test.describe("vehicle inventory dashboard", () => {
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

    // The login redirect is a full page navigation, so the dashboard's
    // client components (filter bar) are server-rendered and visible before
    // React hydration attaches their event handlers. Interacting with the
    // <select>/<input> in that window silently drops the change (confirmed
    // by a debug run: selecting a status immediately after redirect leaves
    // the URL/select unchanged, but the same interaction after the page
    // settles works every time) — wait for hydration to finish first.
    await page.waitForLoadState("networkidle");
  });

  // KPI card labels are rendered as an uppercase <p>, which is a unique
  // enough hook to avoid colliding with the same text in the filter
  // dropdowns or the status/condition badges in the table.
  function kpiValue(page: import("@playwright/test").Page, label: string) {
    return page
      .locator("p.uppercase", { hasText: label })
      .locator("xpath=following-sibling::p[1]");
  }

  test("shows KPI cards with real seeded numbers and a populated vehicle table", async ({
    page,
  }) => {
    // Seed data (supabase/seed.sql) has 10 IN_STOCK, 2 PENDING, 2 IN_TRANSIT,
    // 4 SOLD vehicles, of which 2 were sold in the current calendar month
    // (STK1003, STK1012), and IN_STOCK MSRPs sum to $339,300.
    await expect(kpiValue(page, "In Stock")).toHaveText("10");
    await expect(kpiValue(page, "Pending")).toHaveText("2");
    await expect(kpiValue(page, "In Transit")).toHaveText("2");
    await expect(kpiValue(page, "Sold This Month")).toHaveText("2");
    await expect(kpiValue(page, "Total In-Stock Value")).toHaveText(
      "$339,300",
    );

    // Table is populated with seeded vehicles.
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(19); // 1 header + 18 seeded vehicles
    await expect(page.getByText("STK1001")).toBeVisible();
    await expect(page.getByText("Camry")).toBeVisible();
  });

  test("filtering by status narrows the table to matching rows only", async ({
    page,
  }) => {
    await page.getByLabel("Filter by status").selectOption("PENDING");
    await expect(page).toHaveURL(/status=PENDING/);

    // Seed data has exactly 2 PENDING vehicles: STK1004, STK1013.
    await expect(page.getByRole("row")).toHaveCount(3); // header + 2 matches
    await expect(page.getByText("STK1004")).toBeVisible();
    await expect(page.getByText("STK1013")).toBeVisible();
    await expect(page.getByText("STK1001")).not.toBeVisible();

    const statusCells = page.getByRole("cell", { name: "Pending" });
    await expect(statusCells).toHaveCount(2);
  });

  test("searching narrows the table to matching vehicles", async ({
    page,
  }) => {
    await page.getByLabel("Search vehicles").fill("Silverado");

    // Debounced search — wait for the URL (and thus the server-rendered
    // table) to update rather than an arbitrary timeout.
    await expect(page).toHaveURL(/search=Silverado/);
    await expect(page.getByRole("row")).toHaveCount(2); // header + 1 match
    await expect(page.getByText("STK1007")).toBeVisible();
    await expect(page.getByText("Silverado")).toBeVisible();
    await expect(page.getByText("STK1001")).not.toBeVisible();
  });

  test("a filter combination with no matches shows the empty state", async ({
    page,
  }) => {
    // No SOLD + CPO vehicle exists in the seed data. Wait for each filter's
    // URL param to land before applying the next one — both selects read
    // `searchParams` to build the next URL, so firing them back-to-back
    // races the client-side navigation and can drop the first param.
    await page.getByLabel("Filter by status").selectOption("SOLD");
    await expect(page).toHaveURL(/status=SOLD/);
    await page.getByLabel("Filter by condition").selectOption("CPO");
    await expect(page).toHaveURL(/condition=CPO/);
    await expect(
      page.getByText("No vehicles match these filters."),
    ).toBeVisible();
    await expect(page.getByRole("table")).not.toBeVisible();
  });
});
