import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEMO_CREDENTIALS, SEED_CATEGORIES } from "../../scripts/seed.js";

describe("Phase 6 Operations & Quality", () => {
  it("Demo user credentials match required specifications", () => {
    assert.equal(DEMO_CREDENTIALS.email, "demo@expensetracker.dev");
    assert.equal(DEMO_CREDENTIALS.password, "Demo@12345");
  });

  it("Seed definitions contain all 12 requested categories", () => {
    assert.equal(SEED_CATEGORIES.length, 12);
    const names = SEED_CATEGORIES.map((c) => c.name);
    assert.ok(names.includes("Salary"));
    assert.ok(names.includes("Freelance"));
    assert.ok(names.includes("Rent & Housing"));
    assert.ok(names.includes("Groceries"));
    assert.ok(names.includes("Dining & Food"));
    assert.ok(names.includes("Transport"));
    assert.ok(names.includes("Utilities"));
    assert.ok(names.includes("Entertainment"));
    assert.ok(names.includes("Health & Medical"));
    assert.ok(names.includes("Shopping"));
    assert.ok(names.includes("Travel"));
    assert.ok(names.includes("Investments"));
  });

  it("Seed categories have valid hex colors and icons", () => {
    for (const cat of SEED_CATEGORIES) {
      assert.ok(cat.color.startsWith("#"), `${cat.name} should have valid hex color`);
      assert.ok(typeof cat.icon === "string" && cat.icon.length > 0, `${cat.name} should have valid icon string`);
    }
  });
});
