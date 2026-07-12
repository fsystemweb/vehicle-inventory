import { test, expect, type Page } from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

// Seed data (supabase/seed.sql) has exactly two Chevrolets (STK1007, STK1008)
// and no other vehicle in the shared project uses that make, so it's a safe,
// deterministic filter target even if stray QA-created test vehicles from
// other e2e specs are present in the shared database.
const CHEVY_STOCK_NUMBERS = ["STK1007", "STK1008"];

test.describe("vehicle filter stack", () => {
  test.skip(
    !QA_TEST_EMAIL || !QA_TEST_PASSWORD,
    "QA_TEST_EMAIL / QA_TEST_PASSWORD are not set — see .env.local",
  );

  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/login");
    await page.getByLabel("Email").fill(QA_TEST_EMAIL!);
    await page.getByLabel("Password").fill(QA_TEST_PASSWORD!);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Mirrors the wait in dashboard.spec.ts: the post-login redirect is a
    // full navigation, so interacting with the filter stack before
    // hydration finishes can silently drop the event.
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(() => {
    expect(
      consoleErrors,
      `Unexpected console/page errors:\n${consoleErrors.join("\n")}`,
    ).toEqual([]);
  });

  function filtersAppliedText(page: Page, n: number) {
    return page.getByText(`${n} filter${n === 1 ? "" : "s"} applied`);
  }

  test("filter stack renders above the table as a visually distinct panel", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", { name: "Filters" });
    await expect(heading).toBeVisible();

    // The panel is the bordered/tinted container wrapping the "Filters"
    // heading — distinct from the plain page background.
    const panel = page.locator("div.border-line.bg-mist").first();
    await expect(panel).toBeVisible();
    await expect(panel.getByLabel("Filter by status")).toBeVisible();
    await expect(panel.getByLabel("Filter by condition")).toBeVisible();

    await expect(filtersAppliedText(page, 0)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("typing a text filter debounces, adds a chip, updates the count, and re-filters without a hard reload", async ({
    page,
  }) => {
    // Marker that only survives soft (client-side) navigations — a full
    // page reload would wipe the window object and this would fail.
    await page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__qaNoReloadMarker = true;
    });

    await page.getByLabel("Filter by make").fill("Chevrolet");

    await expect(page).toHaveURL(/make=Chevrolet/);
    await expect(page.getByText("Make: Chevrolet")).toBeVisible();
    await expect(filtersAppliedText(page, 1)).toBeVisible();

    const markerSurvived = await page.evaluate(
      () =>
        (window as unknown as Record<string, unknown>).__qaNoReloadMarker ===
        true,
    );
    expect(markerSurvived).toBe(true);

    for (const stock of CHEVY_STOCK_NUMBERS) {
      await expect(page.getByText(stock)).toBeVisible();
    }
    await expect(page.getByText("STK1001")).not.toBeVisible();
  });

  test("a numeric range and a date range produce correctly labeled chips and filter the table", async ({
    page,
  }) => {
    // Mileage 20,000–29,000 matches exactly STK1010 (28,900), STK1013
    // (24,300), STK1016 (21,000), STK1018 (26,700) in the seed data; no
    // stray QA-created vehicle mileage (100 / 15,000 / 30,000) falls inside
    // this window, so the assertion holds even with leftover test data.
    await page.getByLabel("Mileage minimum").fill("20000");
    await page.getByLabel("Mileage maximum").fill("29000");

    await expect(page).toHaveURL(/mileageMin=20000/);
    await expect(page).toHaveURL(/mileageMax=29000/);
    await expect(page.getByText("Mileage (min): 20,000 mi")).toBeVisible();
    await expect(page.getByText("Mileage (max): 29,000 mi")).toBeVisible();
    await expect(filtersAppliedText(page, 2)).toBeVisible();

    for (const stock of ["STK1010", "STK1013", "STK1016", "STK1018"]) {
      await expect(page.getByText(stock)).toBeVisible();
    }
    await expect(page.getByText("STK1001")).not.toBeVisible();

    // Reset mileage, then verify the received-date range independently.
    await page.getByLabel("Mileage minimum").fill("");
    await page.getByLabel("Mileage maximum").fill("");
    await expect(page).not.toHaveURL(/mileageMin=/);

    // Received 2026-06-01..2026-06-10 matches exactly STK1001, STK1002,
    // STK1015 in the seed data; stray QA vehicles have no received_date set
    // (rendered "—"), so they can't fall in range.
    await page.getByLabel("Received date from").fill("2026-06-01");
    await page.getByLabel("Received date to").fill("2026-06-10");

    await expect(page).toHaveURL(/receivedDateFrom=2026-06-01/);
    await expect(page).toHaveURL(/receivedDateTo=2026-06-10/);
    await expect(page.getByText("Received (from): 2026-06-01")).toBeVisible();
    await expect(page.getByText("Received (to): 2026-06-10")).toBeVisible();

    for (const stock of ["STK1001", "STK1002", "STK1015"]) {
      await expect(page.getByText(stock)).toBeVisible();
    }
    await expect(page.getByText("STK1007")).not.toBeVisible();
  });

  test("removing one filter chip clears only that filter and leaves the rest active", async ({
    page,
  }) => {
    // Honda + PENDING narrows to exactly STK1004 in the seed data (STK1003
    // is Honda but SOLD).
    await page.getByLabel("Filter by make").fill("Honda");
    await expect(page).toHaveURL(/make=Honda/);
    await page.getByLabel("Filter by status").selectOption("PENDING");
    await expect(page).toHaveURL(/status=PENDING/);

    await expect(filtersAppliedText(page, 2)).toBeVisible();
    await expect(page.getByText("STK1004")).toBeVisible();
    await expect(page.getByText("STK1013")).not.toBeVisible(); // PENDING but not Honda

    await page
      .getByRole("button", { name: "Remove filter: Make: Honda" })
      .click();

    await expect(page).not.toHaveURL(/make=Honda/);
    await expect(page).toHaveURL(/status=PENDING/);
    await expect(filtersAppliedText(page, 1)).toBeVisible();
    await expect(page.getByText("Make: Honda")).not.toBeVisible();

    // Both PENDING vehicles show now that the make filter is gone.
    await expect(page.getByText("STK1004")).toBeVisible();
    await expect(page.getByText("STK1013")).toBeVisible();
  });

  test("Clear all removes every active filter in one navigation", async ({
    page,
  }) => {
    await page.getByLabel("Filter by make").fill("Honda");
    await expect(page).toHaveURL(/make=Honda/);
    await page.getByLabel("Filter by status").selectOption("PENDING");
    await expect(page).toHaveURL(/status=PENDING/);
    await page.getByLabel("Mileage minimum").fill("1");
    await expect(page).toHaveURL(/mileageMin=1/);

    await expect(filtersAppliedText(page, 3)).toBeVisible();

    await page.getByRole("button", { name: "Clear all" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page).not.toHaveURL(/make=/);
    await expect(page).not.toHaveURL(/status=/);
    await expect(page).not.toHaveURL(/mileageMin=/);
    await expect(filtersAppliedText(page, 0)).toBeVisible();
    await expect(page.getByLabel("Filter by make")).toHaveValue("");
    await expect(page.getByLabel("Mileage minimum")).toHaveValue("");

    for (const stock of ["STK1001", "STK1004", "STK1007"]) {
      await expect(page.getByText(stock)).toBeVisible();
    }
  });

  test("sorting a column preserves all active filters, including text and range filters", async ({
    page,
  }) => {
    await page.getByLabel("Filter by make").fill("Honda");
    await expect(page).toHaveURL(/make=Honda/);
    await page.getByLabel("Mileage minimum").fill("1");
    await expect(page).toHaveURL(/mileageMin=1/);

    await page.getByRole("link", { name: /^Year/ }).click();

    await expect(page).toHaveURL(/sort=year/);
    await expect(page).toHaveURL(/direction=asc/);
    await expect(page).toHaveURL(/make=Honda/);
    await expect(page).toHaveURL(/mileageMin=1/);

    // Filters remain applied in the UI after the sort navigation, not just
    // in the URL.
    await expect(page.getByText("Make: Honda")).toBeVisible();
    await expect(page.getByText("Mileage (min): 1 mi")).toBeVisible();
  });

  test("filter stack and chips wrap without overflow at a 375px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });

    await page.getByLabel("Filter by make").fill("Chevrolet");
    await expect(page).toHaveURL(/make=Chevrolet/);
    await page.getByLabel("Filter by status").selectOption("IN_STOCK");
    await expect(page).toHaveURL(/status=IN_STOCK/);
    await page.getByLabel("Mileage minimum").fill("1");
    await expect(page).toHaveURL(/mileageMin=1/);

    await expect(filtersAppliedText(page, 3)).toBeVisible();

    // Scope the overflow check to the filter panel itself (its heading row,
    // chip row, and input grid all wrap to a single column at this width) —
    // NOT to document.documentElement.scrollWidth. That check separately
    // caught a *pre-existing* issue, unrelated to this feature: the
    // VehicleTable's wide table (`min-w-[820px]`) escapes its
    // `overflow-x-auto` wrapper and makes the whole page pannable
    // horizontally at narrow viewports (confirmed present on `main` too,
    // since VehicleTable's markup is untouched by this branch — only
    // `buildSortHref` changed). That's worth a follow-up ticket, but it's
    // not something the filter-stack PR introduced or should be blocked on.
    const panel = page.locator("div.border-line.bg-mist").first();
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeGreaterThanOrEqual(0);
    expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(375 + 1);

    for (const label of [
      "Filter by make",
      "Filter by status",
      "Mileage minimum",
    ]) {
      const box = await page.getByLabel(label).boundingBox();
      expect(box).not.toBeNull();
      expect(
        box!.x + box!.width,
        `${label} input overflows the 375px viewport`,
      ).toBeLessThanOrEqual(375 + 1);
    }

    for (const chipText of [
      "Make: Chevrolet",
      "Status: In Stock",
      "Mileage (min): 1 mi",
    ]) {
      const chipBox = await page.getByText(chipText).boundingBox();
      expect(chipBox).not.toBeNull();
      expect(
        chipBox!.x + chipBox!.width,
        `chip "${chipText}" overflows the 375px viewport`,
      ).toBeLessThanOrEqual(375 + 1);
    }

    await expect(page.getByRole("table")).toBeVisible();
  });
});
