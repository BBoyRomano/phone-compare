import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders shareable comparisons without escaping the viewport", async ({ page }, testInfo) => {
  await page.goto("/?left=google-pixel-10-pro-fold&right=samsung-galaxy-z-fold8");

  await expect(page).toHaveTitle("Pixel 10 Pro Fold vs Galaxy Z Fold8 — Phone Compare");
  await expect(page.getByLabel("First phone")).toHaveValue("google-pixel-10-pro-fold");
  await expect(page.getByLabel("Second phone")).toHaveValue("samsung-galaxy-z-fold8");
  await expect(page.getByRole("heading", { name: "What the sources establish" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: /Cover display/ })).toBeVisible();

  const layout = await page.evaluate(() => {
    const tableShell = document.querySelector<HTMLElement>(".table-shell");
    return {
      pageOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      tableScrolls: tableShell ? tableShell.scrollWidth > tableShell.clientWidth : false
    };
  });
  expect(layout.pageOverflows).toBe(false);
  expect(layout.tableScrolls).toBe(testInfo.project.name === "mobile-chromium");
});

test("supports a keyboard-only selection and submit flow", async ({ page }) => {
  await page.goto("/");

  const firstPhone = page.getByLabel("First phone");
  const secondPhone = page.getByLabel("Second phone");
  const submit = page.getByRole("button", { name: "Compare phones" });
  await firstPhone.selectOption("apple-iphone-17");
  await secondPhone.selectOption("apple-iphone-16");

  await firstPhone.focus();
  await page.keyboard.press("Tab");
  await expect(secondPhone).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\?left=apple-iphone-17&right=apple-iphone-16$/);
  await expect(page.getByRole("heading", { name: "iPhone 17 vs iPhone 16" })).toBeVisible();
  await expect(page.getByText("iPhone 17 is in the current comparison-ready lineup")).toBeVisible();
});

test("makes stale selections and unknown routes recoverable", async ({ page }) => {
  await page.goto("/?left=not-in-catalogue&right=samsung-galaxy-z-fold8");
  await expect(page.getByRole("status")).toContainText("Shared selection adjusted");
  await expect(page.getByRole("status")).toContainText("first selection");
  await expect(page.getByLabel("First phone")).toHaveValue("apple-iphone-17");
  await expect(page.getByLabel("Second phone")).toHaveValue("samsung-galaxy-z-fold8");

  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — Phone Compare");
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare phones" })).toHaveAttribute("href", "/");
});

test("has no automatically detectable WCAG A or AA violations", async ({ page }) => {
  for (const path of ["/?left=apple-iphone-air&right=google-pixel-10a", "/not-a-real-page"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});
