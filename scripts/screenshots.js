/**
 * scripts/screenshots.js
 *
 * Captures screenshots of the running app at 1440×900.
 * Prerequisites:
 *   1. Run `npm run seed` to populate demo data.
 *   2. Start the backend:  cd backend && npm run dev
 *   3. Start the frontend: cd frontend && npm run dev
 *   4. Then run: node scripts/screenshots.js
 *
 * Output: docs/screenshots/*.png
 */

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots");
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const DEMO_EMAIL = "demo@expensetracker.dev";
const DEMO_PASSWORD = "Demo@12345";

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log("[Screenshots] Starting capture...");

  try {
    // ── 0. Landing page ────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "00-landing.png"), fullPage: false });
    console.log("[Screenshots] ✓ 00-landing.png");

    // ── 1. Login page ──────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/auth`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01-login.png"), fullPage: false });
    console.log("[Screenshots] ✓ 01-login.png");

    // ── 2. Sign in ─────────────────────────────────────────────────────────
    await page.fill('input[type="email"]', DEMO_EMAIL);
    await page.fill('input[type="password"]', DEMO_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await page.waitForTimeout(2000); // Let charts render

    // ── 3. Dashboard ───────────────────────────────────────────────────────
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02-dashboard.png"), fullPage: false });
    console.log("[Screenshots] ✓ 02-dashboard.png");

    // ── 4. Budgets page ────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/budgets`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "03-budgets.png"), fullPage: false });
    console.log("[Screenshots] ✓ 03-budgets.png");

    // ── 5. Goals page ──────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/goals`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "04-goals.png"), fullPage: false });
    console.log("[Screenshots] ✓ 04-goals.png");

    // ── 6. Transactions page ───────────────────────────────────────────────
    await page.goto(`${BASE_URL}/transactions`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "05-transactions.png"), fullPage: false });
    console.log("[Screenshots] ✓ 05-transactions.png");

    // ── 7. Analytics page ──────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/analytics`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500); // Charts need extra time
    await page.screenshot({ path: path.join(OUTPUT_DIR, "06-analytics.png"), fullPage: false });
    console.log("[Screenshots] ✓ 06-analytics.png");

    // ── 8. Notifications page ──────────────────────────────────────────────
    await page.goto(`${BASE_URL}/notifications`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "07-notifications.png"), fullPage: false });
    console.log("[Screenshots] ✓ 07-notifications.png");

    console.log(`\n[Screenshots] All screenshots saved to: ${OUTPUT_DIR}`);

    // Verify none are blank (size > 50 KB is a good heuristic)
    const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png"));
    let allOk = true;
    for (const f of files) {
      const size = fs.statSync(path.join(OUTPUT_DIR, f)).size;
      if (size < 50_000) {
        console.warn(`[Screenshots] ⚠ ${f} looks blank (${size} bytes)`);
        allOk = false;
      }
    }
    if (allOk) console.log("[Screenshots] ✓ All screenshots look valid");
  } catch (err) {
    console.error("[Screenshots] Error:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
