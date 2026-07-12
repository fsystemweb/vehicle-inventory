import { test, expect } from "@playwright/test";

const QA_TEST_EMAIL = process.env.QA_TEST_EMAIL;
const QA_TEST_PASSWORD = process.env.QA_TEST_PASSWORD;

test.describe("vehicle detail header + table row affordances", () => {
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

  test("Edit vehicle button sits in the header above the fold, and Delete still renders/fires at the bottom", async ({
    page,
  }) => {
    // Navigate to a vehicle's detail page via the seeded table.
    await page.getByText("STK1001").click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);

    const editButton = page.getByRole("link", { name: /Edit vehicle/i });
    await expect(editButton).toBeVisible();

    // Above-the-fold check: bounding box must be within the current
    // (unscrolled) viewport.
    const viewport = page.viewportSize();
    const box = await editButton.boundingBox();
    expect(
      box,
      "Edit vehicle button should have a bounding box",
    ).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

    await page.screenshot({
      path: "test-results/qa-vehicle-detail-header.png",
    });

    await editButton.click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+\/edit$/);

    // Go back to the detail page and confirm Delete still renders at the
    // bottom, on its own, and its confirm() dialog still fires.
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);

    const deleteButton = page.getByRole("button", { name: /Delete/i });
    await expect(deleteButton).toBeVisible();

    let dialogMessage = "";
    page.once("dialog", (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });
    await deleteButton.click();
    await page.waitForTimeout(300);
    expect(dialogMessage).toMatch(/delete/i);

    // Dismissing the dialog should leave us on the same page, vehicle intact.
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
    await expect(page.getByText("STK1001")).toBeVisible();
  });

  test("table rows highlight on hover, are clickable anywhere (not just the Stock # text), and show a chevron at rest", async ({
    page,
  }) => {
    const row = page.locator("tbody tr").filter({ hasText: "STK1001" });
    await expect(row).toBeVisible();

    // Chevron is visible at rest (before any hover).
    const chevron = row.locator("svg").last();
    await expect(chevron).toBeVisible();
    const restColor = await chevron.evaluate(
      (el) => getComputedStyle(el).color,
    );

    // Hover over a cell that is NOT the Stock # link/text (VIN cell) and
    // confirm the row's background changes (hover:bg-mist) and clicking
    // there still navigates via the stretched-link overlay.
    const vinCell = row.locator("td").nth(1);
    await vinCell.hover();

    const hoverBg = await row.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(hoverBg).not.toBe("rgba(0, 0, 0, 0)");
    expect(hoverBg).not.toBe("transparent");

    const hoverColor = await chevron.evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(hoverColor).not.toBe(restColor);

    await page.screenshot({ path: "test-results/qa-vehicle-table-hover.png" });

    // Click on the VIN cell (plain text, not the Stock # link itself) and
    // confirm it still navigates to the detail page via the stretched link.
    await vinCell.click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/\d+$/);
  });
});
