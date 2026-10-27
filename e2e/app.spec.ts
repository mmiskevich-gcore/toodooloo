import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

// Next keeps recently visited routes mounted but hidden, so locators that could
// match a field on another page are filtered to visible elements.

const password = "first-password";
const newPassword = "second-password";

async function latestResetUrl(email: string): Promise<string> {
  const lines = (await readFile(".dev-emails.jsonl", "utf8")).trim().split("\n");
  const mails = lines.map((line) => JSON.parse(line)).filter((m) => m.to === email);
  return mails.at(-1).resetUrl;
}

async function logIn(page: Page, email: string, pw: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").filter({ visible: true }).fill(email);
  await page.getByPlaceholder("Password").filter({ visible: true }).fill(pw);
  await page.getByRole("button", { name: "Log in" }).filter({ visible: true }).click();
}

test("register, manage to-dos, reset password", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  // Logged-out visitors are sent to login
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  // Register
  await page.goto("/register");
  await page.getByPlaceholder("Email").filter({ visible: true }).fill(email);
  await page.getByPlaceholder(/Password/).filter({ visible: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).filter({ visible: true }).click();
  await expect(page.getByText(email)).toBeVisible();

  // Create
  const newTodo = page.getByLabel("New to-do");
  const day = page.getByLabel("Day", { exact: true });
  await day.selectOption("Monday");
  await newTodo.fill("Buy milk");
  await newTodo.press("Enter");
  await day.selectOption("Wednesday");
  await newTodo.fill("Walk the dog");
  await newTodo.press("Enter");
  await expect(page.getByText("2 left")).toBeVisible();
  await expect(newTodo).toHaveValue("");
  // The chosen day stays after adding, for quick entry of several tasks
  await expect(day).toHaveValue("2");

  // Tasks are grouped under their day, empty days are hidden
  const monday = page.getByRole("region", { name: "Monday" });
  const wednesday = page.getByRole("region", { name: "Wednesday" });
  await expect(monday.getByText("Buy milk")).toBeVisible();
  await expect(wednesday.getByText("Walk the dog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tuesday" })).toHaveCount(0);

  // Update: mark done, then rename
  await page.getByLabel('Mark "Buy milk" as done').check();
  await expect(page.getByText("1 left")).toBeVisible();
  await page.getByRole("listitem").filter({ hasText: "Walk the dog" }).getByRole("button", { name: "Edit" }).filter({ visible: true }).click();
  await page.getByLabel("Edit to-do").fill("Walk the cat");
  await page.getByLabel("Edit day").selectOption("Friday");
  await page.getByRole("button", { name: "Save" }).filter({ visible: true }).click();
  await expect(page.getByRole("region", { name: "Friday" }).getByText("Walk the cat")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wednesday" })).toHaveCount(0);

  // Delete
  await page.getByRole("button", { name: 'Delete "Buy milk"' }).click();
  await expect(page.getByText("Buy milk")).toHaveCount(0);

  // Log out
  await page.getByRole("button", { name: "Log out" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Forgot password
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  const resetEmail = page.getByPlaceholder("Email").filter({ visible: true });
  await resetEmail.fill(email);
  await expect(resetEmail).toHaveValue(email);
  await page.getByRole("button", { name: "Send reset link" }).filter({ visible: true }).click();
  await expect(page.getByText(/If an account exists/)).toBeVisible();

  // Reset with the emailed link, which signs the user back in
  const resetUrl = await latestResetUrl(email);
  await page.goto(resetUrl);
  await page.getByPlaceholder(/New password/).filter({ visible: true }).fill(newPassword);
  await page.getByRole("button", { name: "Set new password" }).filter({ visible: true }).click();
  await expect(page.getByText("Walk the cat")).toBeVisible();

  // The link only works once
  await page.goto(resetUrl);
  await page.getByPlaceholder(/New password/).filter({ visible: true }).fill("third-password");
  await page.getByRole("button", { name: "Set new password" }).filter({ visible: true }).click();
  await expect(page.getByText(/invalid or has expired/)).toBeVisible();

  // Old password no longer works, new one does
  await page.context().clearCookies();
  await logIn(page, email, password);
  await expect(page.getByText("Wrong email or password.")).toBeVisible();
  await logIn(page, email, newPassword);
  await expect(page.getByText("Walk the cat")).toBeVisible();
});

test("unknown email gets the same reset reply", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByPlaceholder("Email").filter({ visible: true }).fill(`nobody-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Send reset link" }).filter({ visible: true }).click();
  await expect(page.getByText(/If an account exists/)).toBeVisible();
});

test("users only see their own to-dos", async ({ browser }) => {
  const alice = await browser.newPage();
  const bob = await browser.newPage();
  for (const [page, email] of [
    [alice, `alice-${Date.now()}@example.com`],
    [bob, `bob-${Date.now()}@example.com`],
  ] as const) {
    await page.goto("/register");
    await page.getByPlaceholder("Email").filter({ visible: true }).fill(email);
    await page.getByPlaceholder(/Password/).filter({ visible: true }).fill(password);
    await page.getByRole("button", { name: "Create account" }).filter({ visible: true }).click();
    await expect(page.getByText(email)).toBeVisible();
  }

  await alice.getByLabel("New to-do").fill("Alice's secret");
  await alice.getByLabel("New to-do").press("Enter");
  await expect(alice.getByText("Alice's secret")).toBeVisible();

  await bob.reload();
  await expect(bob.getByText("Nothing planned this week")).toBeVisible();
  await expect(bob.getByText("Alice's secret")).toHaveCount(0);
});
