import {
  test,
  expect,
  type Page,
  type Browser,
  type BrowserContext,
} from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

// A make value that can't collide with seed data (supabase/seed.sql) or with
// stray vehicles left behind by other e2e specs (those use "Toyota", "Ford",
// etc.), so filtering by it gives us a fully self-contained, deterministic
// dataset regardless of what else is in the shared project.
const PAGE_MAKE = "QaPagerMake";
const MODEL_A = "QaPagerModelA";
const MODEL_B = "QaPagerModelB";

// 16 + 6 = 22 vehicles: one more than the page size (20), split so a
// second, narrower filter (model B) lands on exactly one page (6 results).
const COUNT_A = 16;
const COUNT_B = 6;
const TOTAL = COUNT_A + COUNT_B;

// Sequential, unique years so sort order across pages is exactly
// predictable: 2000..2021 (within the service's [1980, current year] bound).
const BASE_YEAR = 2000;

function vinForIndex(i: number) {
  // 17 chars total: an 8-char fixed prefix + a 9-digit zero-padded index.
  return `1QAGPAGE${String(i).padStart(9, "0")}`;
}

function stockNumberForIndex(i: number) {
  // stock_number is varchar(20); keep well under that.
  return `QP-${Date.now().toString(36)}-${i}`.slice(0, 20);
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(QA_TEST_EMAIL!);
  await page.getByLabel("Password").fill(QA_TEST_PASSWORD!);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.waitForLoadState("networkidle");
}

async function createFixtureVehicle(
  page: Page,
  opts: { index: number; year: number; model: string; mileage: number },
): Promise<number | null> {
  await page.goto("/dashboard/vehicles/new");
  await page.getByLabel("VIN").fill(vinForIndex(opts.index));
  await page.getByLabel("Stock #").fill(stockNumberForIndex(opts.index));
  await page.getByLabel("Year").fill(String(opts.year));
  await page.getByLabel("Make").fill(PAGE_MAKE);
  await page.getByLabel("Model").fill(opts.model);
  await page.getByLabel("Mileage").fill(String(opts.mileage));
  await page.getByLabel("Condition").selectOption("USED");
  await page.getByRole("button", { name: /Add Vehicle/i }).click();
  await page.waitForURL(/\/dashboard\/vehicles\/\d+$/);
  const match = page.url().match(/vehicles\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function deleteFixtureVehicle(page: Page, id: number) {
  await page.goto(`/dashboard/vehicles/${id}`);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Delete/i }).click();
  await page.waitForURL(/\/dashboard$/);
}

test.describe("vehicle list pagination", () => {
  test.skip(
    !QA_TEST_EMAIL || !QA_TEST_PASSWORD,
    "QA_TEST_EMAIL / QA_TEST_PASSWORD are not set — see .env.local",
  );

  const createdIds: number[] = [];
  let setupContext: BrowserContext;
  let setupPage: Page;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    setupContext = await browser.newContext();
    setupPage = await setupContext.newPage();
    await login(setupPage);

    for (let i = 0; i < TOTAL; i++) {
      const model = i < COUNT_A ? MODEL_A : MODEL_B;
      const id = await createFixtureVehicle(setupPage, {
        index: i,
        year: BASE_YEAR + i,
        model,
        mileage: 1000 + i,
      });
      if (id != null) createdIds.push(id);
    }
  });

  test.afterAll(async () => {
    for (const id of createdIds) {
      await deleteFixtureVehicle(setupPage, id).catch(() => {});
    }
    await setupContext.close();
  });

  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    await login(page);
  });

  test.afterEach(() => {
    expect(
      consoleErrors,
      `Unexpected console/page errors:\n${consoleErrors.join("\n")}`,
    ).toEqual([]);
  });

  test("shows pagination controls when results exceed one page, and behaves for a single page / zero results", async ({
    page,
  }) => {
    // More than one page: 22 fixture vehicles at PAGE_SIZE=20.
    await page.goto(`/dashboard?make=${PAGE_MAKE}`);
    await expect(page.getByText("Showing 1–20 of 22 vehicles")).toBeVisible();
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(20);
    await expect(page.locator('a[aria-label="Next page"]')).toBeVisible();
    await expect(
      page.locator('span[aria-disabled="true"]', { hasText: "Previous" }),
    ).toBeVisible();

    // Exactly one page's worth (model B: 6 results). Pagination summary
    // still renders (it only hides for zero results) but both nav controls
    // are inert — confirm it doesn't break or offer a working Next/Prev.
    await page.goto(`/dashboard?make=${PAGE_MAKE}&model=${MODEL_B}`);
    await expect(page.getByText("Showing 1–6 of 6 vehicles")).toBeVisible();
    await expect(page.getByText("Page 1 of 1")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(6);
    await expect(
      page.locator('span[aria-disabled="true"]', { hasText: "Previous" }),
    ).toBeVisible();
    await expect(
      page.locator('span[aria-disabled="true"]', { hasText: "Next" }),
    ).toBeVisible();
    await expect(page.locator('a[aria-label="Next page"]')).toHaveCount(0);

    // Zero results: pagination component must not render at all.
    await page.goto(`/dashboard?make=${PAGE_MAKE}&model=NoSuchModelXYZ`);
    await expect(
      page.getByText("No vehicles match these filters."),
    ).toBeVisible();
    await expect(page.getByText(/^Showing/)).toHaveCount(0);
    await expect(page.getByText(/^Page \d+ of \d+$/)).toHaveCount(0);
  });

  test("clicking next/previous navigates pages and shows different vehicles", async ({
    page,
  }) => {
    await page.goto(`/dashboard?make=${PAGE_MAKE}&sort=year&direction=asc`);
    await expect(page.locator("table tbody tr")).toHaveCount(20);
    const page1Stock = await page
      .locator("table tbody tr td:first-child")
      .allTextContents();
    expect(page1Stock).toHaveLength(20);

    await page.locator('a[aria-label="Next page"]').click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(2);
    const page2Stock = await page
      .locator("table tbody tr td:first-child")
      .allTextContents();
    expect(page2Stock).toHaveLength(2);

    // No overlap between the two pages' vehicles.
    for (const stock of page2Stock) {
      expect(page1Stock).not.toContain(stock);
    }

    await page.locator('a[aria-label="Previous page"]').click();
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    const page1Again = await page
      .locator("table tbody tr td:first-child")
      .allTextContents();
    expect(page1Again).toEqual(page1Stock);
  });

  test("sorting is preserved across page changes, and changing sort resets to page 1", async ({
    page,
  }) => {
    await page.goto(`/dashboard?make=${PAGE_MAKE}`);

    await page.getByRole("link", { name: /^Year/ }).click();
    await expect(page).toHaveURL(/sort=year/);
    await expect(page).toHaveURL(/direction=asc/);
    await expect(page).not.toHaveURL(/page=/);

    const yearCells = page.locator("table tbody tr td:nth-child(3)");
    await expect(yearCells).toHaveCount(20);
    await expect(yearCells.first()).toHaveText("2000");
    await expect(yearCells.last()).toHaveText("2019");

    await page.locator('a[aria-label="Next page"]').click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/sort=year/);
    await expect(page).toHaveURL(/direction=asc/);

    const yearCellsPage2 = page.locator("table tbody tr td:nth-child(3)");
    await expect(yearCellsPage2).toHaveCount(2);
    await expect(yearCellsPage2.first()).toHaveText("2020");
    await expect(yearCellsPage2.last()).toHaveText("2021");

    // Now sort by a different column while on page 2 — buildSortHref never
    // carries `page`, so this should land back on page 1 sorted by mileage.
    await page.getByRole("link", { name: /^Mileage/ }).click();
    await expect(page).toHaveURL(/sort=mileage/);
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByText("Page 1 of 2")).toBeVisible();

    const mileageCells = page.locator("table tbody tr td:nth-child(5)");
    await expect(mileageCells).toHaveCount(20);
    await expect(mileageCells.first()).toHaveText("1,000 mi");
    await expect(mileageCells.last()).toHaveText("1,019 mi");
  });

  test("changing a filter resets pagination back to page 1 instead of stranding an out-of-range page", async ({
    page,
  }) => {
    // Deep-link straight to a valid page 2 of the unfiltered (22-result) set.
    await page.goto(
      `/dashboard?make=${PAGE_MAKE}&sort=year&direction=asc&page=2`,
    );
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(2);

    // Narrow with the filter stack: model B has only 6 results (1 page).
    // If `page=2` weren't cleared, this would strand the user on an empty
    // page 2 of a 6-result, 1-page set.
    await page.getByLabel("Filter by model").fill(MODEL_B);
    await expect(page).toHaveURL(new RegExp(`model=${MODEL_B}`));
    await expect(page).not.toHaveURL(/page=/);

    await expect(page.getByText("Showing 1–6 of 6 vehicles")).toBeVisible();
    await expect(page.getByText("Page 1 of 1")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(6);
  });

  test("navigating directly to an out-of-range page does not break the vehicle list", async ({
    page,
  }) => {
    // Only 2 pages exist for this filtered set (22 results / 20 per page).
    // page=3 is the smallest possible out-of-range value — a very plausible
    // case (e.g. a stale bookmark after the result set shrinks). Sort
    // explicitly for a deterministic expected page-2 payload (years
    // 2020/2021 — see the sort/pagination test above).
    const response = await page.goto(
      `/dashboard?make=${PAGE_MAKE}&sort=year&direction=asc&page=3`,
    );
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    // The rest of the dashboard (KPI cards, filter stack) should still be
    // usable even if the vehicle list itself can't render this page.
    await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible();

    // Expected behavior: an out-of-range page clamps to the actual last
    // valid page (2, in this fixture) rather than failing the whole list.
    await expect(page.getByText("Unable to load vehicles")).not.toBeVisible();
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.getByText("Showing 21–22 of 22 vehicles")).toBeVisible();

    const yearCells = page.locator("table tbody tr td:nth-child(3)");
    await expect(yearCells).toHaveCount(2);
    await expect(yearCells.first()).toHaveText("2020");
    await expect(yearCells.last()).toHaveText("2021");
  });
});
