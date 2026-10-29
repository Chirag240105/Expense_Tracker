import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { createTransactionWorkbook } from "../src/utils/createTransactionWorkbook.js";

describe("transaction exports", () => {
  it("writes numeric amounts, dates, and headers to a valid workbook", async () => {
    const buffer = await createTransactionWorkbook("Expense", [
      {
        source: "Groceries",
        amount: { toString: () => "42.50" },
        date: new Date("2026-03-15T12:00:00.000Z"),
        tags: ["food", "weekly"],
        paymentMethod: "card",
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet("Expense");

    assert.ok(worksheet);
    assert.deepEqual(worksheet.getRow(1).values.slice(1), [
      "Source",
      "Amount",
      "Date",
      "Tags",
      "PaymentMethod",
    ]);
    assert.deepEqual(worksheet.getRow(2).values.slice(1), [
      "Groceries",
      42.5,
      "2026-03-15",
      "food, weekly",
      "card",
    ]);
  });

  it("writes headers for empty exports", async () => {
    const buffer = await createTransactionWorkbook("Income", []);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    assert.deepEqual(workbook.getWorksheet("Income").getRow(1).values.slice(1), [
      "Source",
      "Amount",
      "Date",
      "Tags",
      "PaymentMethod",
    ]);
  });
});
