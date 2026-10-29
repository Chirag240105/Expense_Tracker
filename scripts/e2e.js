import { chromium } from "playwright";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: new URL("../backend/.env", import.meta.url) });
dotenv.config({ path: new URL("../.env", import.meta.url), override: false });

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const apiBaseUrl = (process.env.API_BASE_URL || process.env.VITE_API_URL || "http://localhost:9000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");
const email = process.env.SMOKE_EMAIL || "demo@expensetracker.dev";
const password = process.env.SMOKE_PASSWORD || "Demo@12345";

async function api(path, token, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path} failed with ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  let token;
  let transactionId;
  let source;

  try {
    await page.goto(`${frontendUrl}/auth`);
    await page.getByRole("button", { name: /Fill demo credentials/ }).click();
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(`${frontendUrl}/dashboard`, { timeout: 15000 });
    await page.getByText("Total Expense", { exact: true }).first().waitFor();
    await page.locator(".recharts-wrapper").first().waitFor({ timeout: 10000 });

    token = await page.evaluate(() => localStorage.getItem("token"));
    if (!token) throw new Error("Sign-in completed without an access token");
    const beforeDashboard = await api("/api/dashboard", token);
    const beforeBudgets = await api("/api/budgets", token);
    const targetBudget = beforeBudgets.data.find((budget) => budget.categoryName === "Dining & Food");
    if (!targetBudget) throw new Error("Seeded Dining & Food budget was not found");

    source = `E2E expense ${Date.now()}`;
    const amount = 1.37;
    await page.goto(`${frontendUrl}/transactions`);
    await page.getByRole("button", { name: /Add Transaction/ }).first().click();
    await page.locator('input[name="source"]').fill(source);
    await page.locator('input[name="amount"]').fill(String(amount));
    await page.locator('select[name="categoryId"]').selectOption({ label: "Dining & Food" });
    await page.getByRole("button", { name: "Add Transaction" }).last().click();
    await page.getByText(source, { exact: true }).waitFor({ timeout: 10000 });

    const afterDashboard = await api("/api/dashboard", token);
    const afterBudgets = await api("/api/budgets", token);
    const updatedBudget = afterBudgets.data.find((budget) => budget._id === targetBudget._id);
    if (afterDashboard.data.lifetime.totalExpense <= beforeDashboard.data.lifetime.totalExpense) {
      throw new Error("Dashboard expense total did not increase after adding the expense");
    }
    if (!updatedBudget || updatedBudget.spent <= targetBudget.spent) {
      throw new Error("Dining budget progress did not increase after adding the expense");
    }
    const addedTransaction = await api(`/api/transactions?search=${encodeURIComponent(source)}&limit=10`, token);
    transactionId = addedTransaction.data.find((item) => item.source === source)?._id;
    if (!transactionId) throw new Error("The new expense was not present in the transaction list");

    await page.getByRole("button", { name: /profile menu/i }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.waitForURL(`${frontendUrl}/auth`, { timeout: 10000 });
    if (await page.evaluate(() => localStorage.getItem("token"))) {
      throw new Error("Logout did not clear the access token");
    }
    if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join("; ")}`);
    console.log("[E2E] Login, dashboard charts, expense creation, transaction visibility, totals, budget progress, and logout passed.");
  } finally {
    try {
      if (token && transactionId) {
        await api(`/api/transactions/${transactionId}`, token, { method: "DELETE" });
      }
    } finally {
      await browser.close();
      if (source && transactionId) {
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to clean up the E2E transaction");
        await mongoose.connect(process.env.MONGO_URI);
        try {
          await mongoose.connection.db.collection("transactions").deleteOne({
            _id: new mongoose.Types.ObjectId(transactionId),
            source,
          });
        } finally {
          await mongoose.disconnect();
        }
      }
    }
  }
}

main().catch((error) => {
  console.error("[E2E] FAILED:", error.message);
  process.exitCode = 1;
});
