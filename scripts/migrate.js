import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB, { disconnectDB } from "../backend/src/Database/db.js";
import { Transaction } from "../backend/src/models/Transaction.models.js";
import { Category } from "../backend/src/models/Category.models.js";

dotenv.config();

const isDryRun = process.argv.includes("--dry-run");

const defaultCategories = [
  { name: "Salary", type: "income", color: "#10B981", icon: "briefcase", isDefault: true },
  { name: "Freelance", type: "income", color: "#06B6D4", icon: "code", isDefault: true },
  { name: "Investments", type: "income", color: "#8B5CF6", icon: "trending-up", isDefault: true },
  { name: "Other Income", type: "income", color: "#64748B", icon: "plus-circle", isDefault: true },
  { name: "Rent & Housing", type: "expense", color: "#EF4444", icon: "home", isDefault: true },
  { name: "Groceries", type: "expense", color: "#F59E0B", icon: "shopping-cart", isDefault: true },
  { name: "Dining & Food", type: "expense", color: "#F97316", icon: "coffee", isDefault: true },
  { name: "Transport", type: "expense", color: "#3B82F6", icon: "truck", isDefault: true },
  { name: "Utilities", type: "expense", color: "#EAB308", icon: "zap", isDefault: true },
  { name: "Entertainment", type: "expense", color: "#EC4899", icon: "film", isDefault: true },
  { name: "Health & Medical", type: "expense", color: "#14B8A6", icon: "activity", isDefault: true },
  { name: "Shopping", type: "expense", color: "#A855F7", icon: "shopping-bag", isDefault: true },
  { name: "Travel", type: "expense", color: "#6366F1", icon: "compass", isDefault: true },
];

export async function runMigration() {
  console.log(`\n========================================`);
  console.log(`[Migration] Starting ${isDryRun ? "DRY-RUN" : "LIVE"} schema migration...`);
  console.log(`========================================\n`);

  await connectDB();
  const db = mongoose.connection.db;

  // 1. Ensure default system categories
  console.log("[1/3] Checking default system categories...");
  let categoriesCreated = 0;
  for (const cat of defaultCategories) {
    const existing = await Category.findOne({ userId: null, name: cat.name, type: cat.type });
    if (!existing) {
      if (!isDryRun) {
        await Category.create(cat);
      }
      categoriesCreated++;
    }
  }
  console.log(`[1/3] Default categories: ${categoriesCreated} ${isDryRun ? "would be" : "were"} created.`);

  // 2. Check legacy incomes collection
  console.log("[2/3] Inspecting legacy 'incomes' collection...");
  let incomesMigrated = 0;
  let incomesSkipped = 0;
  const collections = await db.listCollections().toArray();
  const hasIncomes = collections.some((c) => c.name === "incomes");

  if (hasIncomes) {
    const incomes = await db.collection("incomes").find({}).toArray();
    console.log(`Found ${incomes.length} records in 'incomes'.`);
    for (const doc of incomes) {
      const alreadyExists = await Transaction.findById(doc._id);
      if (alreadyExists) {
        incomesSkipped++;
        continue;
      }
      if (!isDryRun) {
        await Transaction.create({
          _id: doc._id,
          userId: doc.userId,
          type: "income",
          source: doc.source || "Income",
          amount: mongoose.Types.Decimal128.fromString(parseFloat(doc.amount || 0).toFixed(2)),
          date: doc.date || doc.createdAt || new Date(),
          icon: doc.icon || "briefcase",
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || new Date(),
        });
      }
      incomesMigrated++;
    }
  } else {
    console.log("No legacy 'incomes' collection found. Skipping.");
  }
  console.log(`[2/3] Incomes: ${incomesMigrated} migrated, ${incomesSkipped} already in transactions.`);

  // 3. Check legacy expenses collection
  console.log("[3/3] Inspecting legacy 'expenses' collection...");
  let expensesMigrated = 0;
  let expensesSkipped = 0;
  const hasExpenses = collections.some((c) => c.name === "expenses");

  if (hasExpenses) {
    const expenses = await db.collection("expenses").find({}).toArray();
    console.log(`Found ${expenses.length} records in 'expenses'.`);
    for (const doc of expenses) {
      const alreadyExists = await Transaction.findById(doc._id);
      if (alreadyExists) {
        expensesSkipped++;
        continue;
      }
      if (!isDryRun) {
        await Transaction.create({
          _id: doc._id,
          userId: doc.userId,
          type: "expense",
          source: doc.source || "Expense",
          amount: mongoose.Types.Decimal128.fromString(parseFloat(doc.amount || 0).toFixed(2)),
          date: doc.date || doc.createdAt || new Date(),
          icon: doc.icon || "receipt",
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || new Date(),
        });
      }
      expensesMigrated++;
    }
  } else {
    console.log("No legacy 'expenses' collection found. Skipping.");
  }
  console.log(`[3/3] Expenses: ${expensesMigrated} migrated, ${expensesSkipped} already in transactions.`);

  console.log(`\n========================================`);
  console.log(`[Migration] Completed successfully (${isDryRun ? "DRY-RUN - no changes saved" : "LIVE MIGRATION APPLIED"}).`);
  console.log(`========================================\n`);

  await disconnectDB();
}

if (process.argv[1].endsWith("migrate.js")) {
  runMigration().catch((err) => {
    console.error("[Migration] Error:", err);
    process.exit(1);
  });
}
