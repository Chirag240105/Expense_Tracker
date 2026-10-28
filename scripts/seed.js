import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB, { disconnectDB } from "../backend/src/Database/db.js";
import {
  User,
  Category,
  Transaction,
  Budget,
  Goal,
  RecurringRule,
  Notification,
  AuditLog,
} from "../backend/src/models/index.js";
import { syncAllIndexes } from "../backend/src/Database/syncIndexes.js";

dotenv.config();

const isReset = process.argv.includes("--reset");
const bulkIndex = process.argv.indexOf("--bulk");
const bulkCount = bulkIndex !== -1 ? parseInt(process.argv[bulkIndex + 1], 10) || 50000 : null;

export const DEMO_CREDENTIALS = {
  email: "demo@expensetracker.dev",
  password: "Demo@12345",
  username: "Demo Explorer",
};

export const SEED_CATEGORIES = [
  { name: "Salary", type: "income", color: "#10B981", icon: "briefcase", isDefault: true },
  { name: "Freelance", type: "income", color: "#06B6D4", icon: "code", isDefault: true },
  { name: "Investments", type: "income", color: "#8B5CF6", icon: "trending-up", isDefault: true },
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

const NYC_LOCATIONS = [
  { name: "Whole Foods Market", coords: [-73.9888, 40.7536] },
  { name: "Trader Joe's", coords: [-73.9897, 40.7354] },
  { name: "Blue Bottle Coffee", coords: [-73.9832, 40.7527] },
  { name: "Joe's Pizza", coords: [-74.0022, 40.7306] },
  { name: "Target Midtown", coords: [-73.9868, 40.7497] },
  { name: "Metropolitan Pharmacy", coords: [-73.9782, 40.7614] },
  { name: "MTA Subway Station", coords: [-73.9857, 40.7505] },
  { name: "AMC Empire Cinema", coords: [-73.9882, 40.7570] },
];

export async function seed() {
  const now = new Date();
  console.log("\n============================================================");
  console.log("   🌱 EXPENSE TRACKER - DATABASE SEEDER");
  console.log("============================================================\n");

  await connectDB();
  await syncAllIndexes();

  // 1. Setup Demo User
  let demoUser = await User.findOne({ email: DEMO_CREDENTIALS.email });

  if (isReset && demoUser) {
    console.log(`[Reset] Clearing existing demo user data for: ${DEMO_CREDENTIALS.email}...`);
    await Transaction.deleteMany({ userId: demoUser._id });
    await Budget.deleteMany({ userId: demoUser._id });
    await Goal.deleteMany({ userId: demoUser._id });
    await RecurringRule.deleteMany({ userId: demoUser._id });
    await Notification.deleteMany({ userId: demoUser._id });
    await AuditLog.deleteMany({ userId: demoUser._id });
    await Category.deleteMany({ userId: demoUser._id });
    await User.deleteOne({ _id: demoUser._id });
    demoUser = null;
  }

  if (!demoUser) {
    console.log(`[User] Creating demo user (${DEMO_CREDENTIALS.email})...`);
    demoUser = await User.create({
      username: DEMO_CREDENTIALS.username,
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      preferences: { currency: "USD", theme: "dark", notificationsEnabled: true },
    });
  } else {
    console.log(`[User] Demo user already exists: ${demoUser.email}`);
  }

  // 2. Setup Categories
  console.log("[Categories] Setting up categories...");
  const categoryMap = new Map();

  for (const cat of SEED_CATEGORIES) {
    let doc = await Category.findOne({ userId: demoUser._id, name: cat.name, type: cat.type });
    if (!doc) {
      doc = await Category.create({
        userId: demoUser._id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isDefault: false,
      });
    }
    categoryMap.set(cat.name, doc._id);
  }

  // 3. Setup ~12 Months of Realistic Transactions (~700 - 850 docs)
  const existingTxCount = await Transaction.countDocuments({ userId: demoUser._id });
  if (existingTxCount < 100 || isReset) {
    console.log("[Transactions] Generating ~12 months of realistic transactions (~750 records)...");
    const transactions = [];

    for (let m = 11; m >= 0; m--) {
      const year = now.getFullYear();
      const month = now.getMonth() - m;
      const baseDate = new Date(year, month, 1);

      // Monthly Income: Primary salary on 1st
      transactions.push({
        userId: demoUser._id,
        type: "income",
        amount: mongoose.Types.Decimal128.fromString("6250.00"),
        source: "Acme Corp Tech Lead Salary",
        description: "Direct deposit monthly payroll",
        categoryId: categoryMap.get("Salary"),
        icon: "briefcase",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 9, 0),
        tags: ["salary", "payroll", "primary"],
        paymentMethod: "bank_transfer",
      });

      // 15th: Freelance / Consulting
      if (m % 2 === 0) {
        transactions.push({
          userId: demoUser._id,
          type: "income",
          amount: mongoose.Types.Decimal128.fromString("1450.00"),
          source: "Cloud Advisory & Code Review",
          description: "Technical consulting milestone",
          categoryId: categoryMap.get("Freelance"),
          icon: "code",
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15, 14, 30),
          tags: ["freelance", "consulting", "side-income"],
          paymentMethod: "bank_transfer",
        });
      }

      // Dividends / Investments quarterly
      if (m % 3 === 0) {
        transactions.push({
          userId: demoUser._id,
          type: "income",
          amount: mongoose.Types.Decimal128.fromString("480.00"),
          source: "Vanguard Total Stock Dividend",
          description: "Quarterly portfolio dividend distribution",
          categoryId: categoryMap.get("Investments"),
          icon: "trending-up",
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 20, 11, 0),
          tags: ["investments", "dividends", "passive"],
          paymentMethod: "bank_transfer",
        });
      }

      // 2nd: Rent
      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString("1850.00"),
        source: "Skyline Residential Management",
        description: "Apartment #8B monthly rent",
        categoryId: categoryMap.get("Rent & Housing"),
        icon: "home",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 2, 8, 30),
        tags: ["rent", "housing", "essential"],
        paymentMethod: "bank_transfer",
        isRecurring: true,
      });

      // Utilities: Electricity & Internet
      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString((140 + (m % 4) * 15).toFixed(2)),
        source: "ConEdison Power & Gas",
        description: "Monthly electricity and climate bill",
        categoryId: categoryMap.get("Utilities"),
        icon: "zap",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 14, 10, 0),
        tags: ["utilities", "power"],
        paymentMethod: "debit_card",
        isRecurring: true,
      });

      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString("79.99"),
        source: "Verizon Fios Gigabit Fiber",
        description: "High speed home internet connection",
        categoryId: categoryMap.get("Utilities"),
        icon: "zap",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 18, 12, 0),
        tags: ["utilities", "internet"],
        paymentMethod: "debit_card",
        isRecurring: true,
      });

      // Groceries: 6-7 trips per month
      for (let g = 1; g <= 6; g++) {
        const day = Math.min(28, Math.floor(g * 4.5));
        const loc = NYC_LOCATIONS[g % 2];
        const gAmount = (75 + Math.random() * 60).toFixed(2);
        transactions.push({
          userId: demoUser._id,
          type: "expense",
          amount: mongoose.Types.Decimal128.fromString(gAmount),
          source: loc.name,
          description: "Fresh pantry, produce and household groceries",
          categoryId: categoryMap.get("Groceries"),
          icon: "shopping-cart",
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day, 18, 15),
          tags: ["groceries", "food", "weekly"],
          paymentMethod: "credit_card",
          location: {
            type: "Point",
            coordinates: loc.coords,
          },
        });
      }

      // Dining & Coffee: 18-22 trips per month
      for (let d = 1; d <= 20; d++) {
        const day = Math.min(28, Math.floor(d * 1.35) + 1);
        const isCoffee = d % 3 !== 0;
        const loc = NYC_LOCATIONS[isCoffee ? 2 : 3];
        const amount = isCoffee ? (6.5 + Math.random() * 5).toFixed(2) : (35.0 + Math.random() * 45).toFixed(2);

        transactions.push({
          userId: demoUser._id,
          type: "expense",
          amount: mongoose.Types.Decimal128.fromString(amount),
          source: loc.name,
          description: isCoffee ? "Morning artisan latte & pastry" : "Dinner with colleagues",
          categoryId: categoryMap.get("Dining & Food"),
          icon: "coffee",
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day, isCoffee ? 8 : 20, 15),
          tags: [isCoffee ? "coffee" : "dinner", "dining"],
          paymentMethod: "credit_card",
          location: {
            type: "Point",
            coordinates: loc.coords,
          },
        });
      }

      // Transport: 18-22 trips per month (MTA Subway & rideshare)
      for (let t = 1; t <= 20; t++) {
        const day = Math.min(28, Math.floor(t * 1.35) + 1);
        const isRideshare = t % 7 === 0;
        const loc = NYC_LOCATIONS[6];
        transactions.push({
          userId: demoUser._id,
          type: "expense",
          amount: mongoose.Types.Decimal128.fromString(isRideshare ? "38.50" : "2.90"),
          source: isRideshare ? "Uber Technologies Ride" : "MTA OMNY Metro",
          description: isRideshare ? "Airport / late night transit" : "Subway transit commute",
          categoryId: categoryMap.get("Transport"),
          icon: "truck",
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day, isRideshare ? 22 : 9, 5),
          tags: ["transport", "transit"],
          paymentMethod: isRideshare ? "credit_card" : "debit_card",
          location: {
            type: "Point",
            coordinates: loc.coords,
          },
        });
      }

      // Entertainment & Streaming
      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString("19.99"),
        source: "Netflix Streaming Premium",
        description: "Monthly 4K HDR entertainment plan",
        categoryId: categoryMap.get("Entertainment"),
        icon: "film",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 8, 12, 0),
        tags: ["entertainment", "subscription"],
        paymentMethod: "credit_card",
        isRecurring: true,
      });

      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString("15.99"),
        source: "Spotify Music Family",
        description: "Audio streaming subscription",
        categoryId: categoryMap.get("Entertainment"),
        icon: "film",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 16, 10, 0),
        tags: ["entertainment", "music"],
        paymentMethod: "credit_card",
        isRecurring: true,
      });

      // Shopping & Health
      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString((45 + Math.random() * 90).toFixed(2)),
        source: "Target Midtown Manhattan",
        description: "Household essentials and clothing items",
        categoryId: categoryMap.get("Shopping"),
        icon: "shopping-bag",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 21, 16, 20),
        tags: ["shopping", "retail"],
        paymentMethod: "credit_card",
        location: {
          type: "Point",
          coordinates: NYC_LOCATIONS[4].coords,
        },
      });

      transactions.push({
        userId: demoUser._id,
        type: "expense",
        amount: mongoose.Types.Decimal128.fromString((35 + Math.random() * 40).toFixed(2)),
        source: "Metropolitan Pharmacy & Wellness",
        description: "Vitamins, prescriptions and wellness care",
        categoryId: categoryMap.get("Health & Medical"),
        icon: "activity",
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 24, 15, 0),
        tags: ["health", "medical"],
        paymentMethod: "debit_card",
        location: {
          type: "Point",
          coordinates: NYC_LOCATIONS[5].coords,
        },
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`[Transactions] Inserted ${transactions.length} realistic transactions.`);
  } else {
    console.log(`[Transactions] Already contains ${existingTxCount} records.`);
  }

  // 4. Setup Budgets (Intentionally set Dining OVER limit and Groceries NEAR limit)
  console.log("[Budgets] Setting up active budgets...");
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const budgetDefs = [
    { cat: "Dining & Food", amount: "320.00", threshold: 0.8 }, // Will show EXCEEDED (~$390 spent)
    { cat: "Groceries", amount: "520.00", threshold: 0.8 },     // Will show WARNING (~$460 spent, 88%)
    { cat: "Rent & Housing", amount: "1900.00", threshold: 0.9 }, // Normal
    { cat: "Transport", amount: "160.00", threshold: 0.8 },        // Normal
    { cat: "Entertainment", amount: "100.00", threshold: 0.8 },    // Normal
    { cat: "Utilities", amount: "250.00", threshold: 0.8 },        // Normal
  ];

  for (const b of budgetDefs) {
    const catId = categoryMap.get(b.cat);
    if (!catId) continue;
    const existing = await Budget.findOne({ userId: demoUser._id, categoryId: catId });
    if (!existing) {
      await Budget.create({
        userId: demoUser._id,
        categoryId: catId,
        amount: b.amount,
        period: "monthly",
        startDate: currentMonthStart,
        endDate: currentMonthEnd,
        alertThreshold: b.threshold,
        isActive: true,
      });
    }
  }

  // 5. Setup Savings Goals
  console.log("[Goals] Setting up savings goals...");
  const goalDefs = [
    {
      title: "6-Month Emergency Safety Fund",
      target: "12000.00",
      current: "9500.00",
      category: "Emergency",
      color: "#10B981",
      icon: "shield",
      deadline: new Date(now.getFullYear() + 1, 5, 30),
      contributions: [
        { amount: "3000.00", note: "Initial seed deposit", date: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        { amount: "2500.00", note: "Q1 Tax refund savings", date: new Date(now.getFullYear(), now.getMonth() - 3, 15) },
        { amount: "2000.00", note: "Mid-year bonus allocation", date: new Date(now.getFullYear(), now.getMonth() - 2, 10) },
        { amount: "2000.00", note: "Monthly recurring savings", date: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
      ],
      status: "in_progress",
    },
    {
      title: "Tokyo & Kyoto Spring Trip",
      target: "4500.00",
      current: "2850.00",
      category: "Travel",
      color: "#6366F1",
      icon: "compass",
      deadline: new Date(now.getFullYear() + 1, 3, 15),
      contributions: [
        { amount: "1000.00", note: "Flight fund deposit", date: new Date(now.getFullYear(), now.getMonth() - 4, 1) },
        { amount: "1000.00", note: "Hotel reservation buffer", date: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
        { amount: "850.00", note: "JR Rail pass and activities", date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
      ],
      status: "in_progress",
    },
    {
      title: "MacBook Pro M4 Max Developer Workstation",
      target: "2499.00",
      current: "2499.00",
      category: "Tech",
      color: "#8B5CF6",
      icon: "laptop",
      deadline: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      contributions: [
        { amount: "1200.00", note: "Freelance bonus", date: new Date(now.getFullYear(), now.getMonth() - 3, 1) },
        { amount: "1299.00", note: "Final contribution", date: new Date(now.getFullYear(), now.getMonth() - 1, 20) },
      ],
      status: "achieved",
    },
  ];

  for (const g of goalDefs) {
    const existing = await Goal.findOne({ userId: demoUser._id, title: g.title });
    if (!existing) {
      await Goal.create({
        userId: demoUser._id,
        title: g.title,
        targetAmount: g.target,
        currentAmount: g.current,
        deadline: g.deadline,
        category: g.category,
        color: g.color,
        icon: g.icon,
        contributions: g.contributions,
        status: g.status,
      });
    }
  }

  // 6. Setup Recurring Rules
  console.log("[Recurring] Setting up recurring scheduling rules...");
  const rules = [
    {
      source: "Acme Corp Tech Lead Salary",
      type: "income",
      amount: "6250.00",
      frequency: "monthly",
      categoryId: categoryMap.get("Salary"),
      nextRunAt: new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0),
    },
    {
      source: "Skyline Residential Management Rent",
      type: "expense",
      amount: "1850.00",
      frequency: "monthly",
      categoryId: categoryMap.get("Rent & Housing"),
      nextRunAt: new Date(now.getFullYear(), now.getMonth() + 1, 2, 8, 30),
    },
    {
      source: "Netflix Streaming Premium",
      type: "expense",
      amount: "19.99",
      frequency: "monthly",
      categoryId: categoryMap.get("Entertainment"),
      nextRunAt: new Date(now.getFullYear(), now.getMonth() + 1, 8, 12, 0),
    },
  ];

  for (const r of rules) {
    const existing = await RecurringRule.findOne({ userId: demoUser._id, source: r.source });
    if (!existing) {
      await RecurringRule.create({
        userId: demoUser._id,
        ...r,
        isActive: true,
      });
    }
  }

  // 7. Setup Notifications
  console.log("[Notifications] Setting up demo alerts...");
  const notifs = [
    {
      type: "budget_alert",
      title: "Dining Budget Exceeded ⚠️",
      message: "You have spent $394.50 of your $320.00 monthly Dining budget (123% used).",
      data: { category: "Dining & Food", percentage: 123 },
    },
    {
      type: "budget_alert",
      title: "Groceries Budget Alert (88%)",
      message: "Groceries spending reached $458.00 of your $520.00 limit for this period.",
      data: { category: "Groceries", percentage: 88 },
    },
    {
      type: "goal_achieved",
      title: "Goal Achieved! 🎉",
      message: "Congratulations! You have reached your target for 'MacBook Pro M4 Max Developer Workstation' ($2,499.00).",
      data: { goal: "MacBook Pro M4 Max Developer Workstation" },
    },
    {
      type: "system",
      title: "Welcome to Expense Tracker Pro",
      message: "Your financial dashboard, categories, budgets, and savings goals are active.",
      data: {},
    },
  ];

  for (const n of notifs) {
    const existing = await Notification.findOne({ userId: demoUser._id, title: n.title });
    if (!existing) {
      await Notification.create({
        userId: demoUser._id,
        ...n,
        isRead: false,
      });
    }
  }

  // 8. Setup Sample Audit Logs
  const auditLogs = [
    { action: "USER_LOGIN", resource: "auth", details: { method: "password", client: "Web Chrome" }, ip: "192.168.1.1" },
    { action: "UPDATE_PROFILE", resource: "user", details: { theme: "dark", currency: "USD" }, ip: "192.168.1.1" },
    { action: "CREATE_BUDGET", resource: "budget", details: { category: "Dining & Food", amount: 320 }, ip: "192.168.1.1" },
  ];
  for (const log of auditLogs) {
    await AuditLog.create({
      userId: demoUser._id,
      ...log,
      createdAt: new Date(Date.now() - Math.random() * 86400 * 1000 * 5),
    });
  }

  // 9. Bulk Mode if requested
  if (bulkCount && bulkCount > 0) {
    console.log(`\n🚀 [Bulk Mode] Generating ${bulkCount} performance test transactions in batches...`);
    const batchSize = 5000;
    const totalBatches = Math.ceil(bulkCount / batchSize);
    const catKeys = Array.from(categoryMap.values());

    for (let b = 0; b < totalBatches; b++) {
      const ops = [];
      const currentBatchCount = Math.min(batchSize, bulkCount - b * batchSize);
      for (let i = 0; i < currentBatchCount; i++) {
        const isInc = i % 5 === 0;
        const randomDays = Math.floor(Math.random() * 730);
        ops.push({
          insertOne: {
            document: {
              userId: demoUser._id,
              type: isInc ? "income" : "expense",
              amount: mongoose.Types.Decimal128.fromString((Math.random() * 400 + 5).toFixed(2)),
              source: isInc ? `Direct Deposit Payment #${b * batchSize + i}` : `Retail Merchant Transaction #${b * batchSize + i}`,
              description: `High-volume performance load testing transaction doc #${b * batchSize + i}`,
              notes: `Indexed query performance validation record`,
              categoryId: catKeys[i % catKeys.length],
              date: new Date(Date.now() - randomDays * 86400 * 1000),
              tags: ["performance", "benchmark", isInc ? "income" : "expense"],
              paymentMethod: "credit_card",
              isDeleted: false,
            },
          },
        });
      }
      await Transaction.bulkWrite(ops, { ordered: false });
      process.stdout.write(`   Batch ${b + 1}/${totalBatches} (${(b + 1) * batchSize > bulkCount ? bulkCount : (b + 1) * batchSize} records inserted)\r`);
    }
    console.log(`\n✅ [Bulk Mode] Successfully populated ${bulkCount} high-throughput benchmark transactions.`);
  }

  console.log("\n============================================================");
  console.log("   ✨ SEEDING COMPLETE! DEMO CREDENTIALS:");
  console.log("------------------------------------------------------------");
  console.log(`   Email:    ${DEMO_CREDENTIALS.email}`);
  console.log(`   Password: ${DEMO_CREDENTIALS.password}`);
  console.log("============================================================\n");

  await disconnectDB();
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
