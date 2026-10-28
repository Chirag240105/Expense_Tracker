import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB, { disconnectDB } from "../backend/src/Database/db.js";
import { Transaction } from "../backend/src/models/Transaction.models.js";
import { User } from "../backend/src/models/User.models.js";
import { syncAllIndexes } from "../backend/src/Database/syncIndexes.js";

dotenv.config();

async function runExplainBenchmark() {
  console.log("\n=======================================================");
  console.log("   MongoDB Explain Plan Performance Benchmark");
  console.log("=======================================================\n");

  await connectDB();
  await syncAllIndexes();

  // Find or create a benchmark user
  let benchUser = await User.findOne({ email: "benchmark@expensetracker.dev" });
  if (!benchUser) {
    benchUser = await User.create({
      username: "benchmark",
      email: "benchmark@expensetracker.dev",
      password: "BenchmarkPassword123!",
    });
  }

  // Ensure at least 1,500 sample records for measurable executionStats
  const count = await Transaction.countDocuments({ userId: benchUser._id });
  if (count < 1500) {
    console.log(`[Setup] Inserting 1,500 sample transactions for explain benchmarks...`);
    const docs = [];
    const now = Date.now();
    for (let i = 0; i < 1500; i++) {
      const isIncome = i % 4 === 0;
      docs.push({
        userId: benchUser._id,
        type: isIncome ? "income" : "expense",
        amount: mongoose.Types.Decimal128.fromString((Math.random() * 500 + 10).toFixed(2)),
        source: isIncome ? `Client Payment #${i}` : `Coffee & Grocery #${i}`,
        description: `Regular recurring purchase transaction reference #${i}`,
        notes: `Checked out via mobile card pos terminal terminal-${i % 10}`,
        tags: [isIncome ? "salary" : "food", "daily", `tag-${i % 5}`],
        date: new Date(now - i * 3600 * 1000 * 6), // spread over past months
        location: {
          type: "Point",
          coordinates: [-73.9851 + (Math.random() - 0.5) * 0.1, 40.7488 + (Math.random() - 0.5) * 0.1],
        },
      });
    }
    await Transaction.insertMany(docs);
    console.log(`[Setup] 1,500 benchmark transactions ready.`);
  }

  const queryDate = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  // 1. Benchmark: User + Date Range Query
  console.log("\n📊 Benchmark 1: User + Date Range Query ({ userId, date: { $gte: 30_days_ago } })");
  const unindexedPlan1 = await Transaction.find({ userId: benchUser._id, date: { $gte: queryDate } })
    .hint({ $natural: 1 })
    .explain("executionStats");

  const indexedPlan1 = await Transaction.find({ userId: benchUser._id, date: { $gte: queryDate } })
    .hint({ userId: 1, date: -1 })
    .explain("executionStats");

  const stat1Col = unindexedPlan1.executionStats;
  const stat1Ix = indexedPlan1.executionStats;

  console.log("----------------------------------------------------------------------------------");
  console.log(`Unindexed (COLLSCAN): docsExamined=${stat1Col.totalDocsExamined}, time=${stat1Col.executionTimeMillis}ms, returned=${stat1Col.nReturned}`);
  console.log(`Indexed   (IXSCAN):   docsExamined=${stat1Ix.totalDocsExamined}, time=${stat1Ix.executionTimeMillis}ms, returned=${stat1Ix.nReturned}`);
  console.log(`Reduction in docs examined: ${((1 - stat1Ix.totalDocsExamined / Math.max(1, stat1Col.totalDocsExamined)) * 100).toFixed(1)}%`);

  // 2. Benchmark: Compound User + Type + Date Query
  console.log("\n📊 Benchmark 2: User + Type + Date ({ userId, type: 'expense', date: { $gte: 30_days_ago } })");
  const unindexedPlan2 = await Transaction.find({ userId: benchUser._id, type: "expense", date: { $gte: queryDate } })
    .hint({ $natural: 1 })
    .explain("executionStats");

  const indexedPlan2 = await Transaction.find({ userId: benchUser._id, type: "expense", date: { $gte: queryDate } })
    .hint({ userId: 1, type: 1, date: -1 })
    .explain("executionStats");

  const stat2Col = unindexedPlan2.executionStats;
  const stat2Ix = indexedPlan2.executionStats;

  console.log("----------------------------------------------------------------------------------");
  console.log(`Unindexed (COLLSCAN): docsExamined=${stat2Col.totalDocsExamined}, time=${stat2Col.executionTimeMillis}ms, returned=${stat2Col.nReturned}`);
  console.log(`Indexed   (IXSCAN):   docsExamined=${stat2Ix.totalDocsExamined}, time=${stat2Ix.executionTimeMillis}ms, returned=${stat2Ix.nReturned}`);
  console.log(`Reduction in docs examined: ${((1 - stat2Ix.totalDocsExamined / Math.max(1, stat2Col.totalDocsExamined)) * 100).toFixed(1)}%`);

  // 3. Benchmark: Text Search Query
  console.log("\n📊 Benchmark 3: Full-Text Search ({ $text: { $search: 'coffee' } })");
  const textPlan = await Transaction.find({ userId: benchUser._id, $text: { $search: "coffee" } }).explain("executionStats");
  const statText = textPlan.executionStats;
  console.log("----------------------------------------------------------------------------------");
  console.log(`Text Index (TEXT_MATCH): docsExamined=${statText.totalDocsExamined}, time=${statText.executionTimeMillis}ms, returned=${statText.nReturned}`);

  // 4. Benchmark: Geospatial Query
  console.log("\n📊 Benchmark 4: Geospatial $nearSphere (Within 5km of NYC center)");
  const geoPlan = await Transaction.find({
    userId: benchUser._id,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [-73.9851, 40.7488] },
        $maxDistance: 5000,
      },
    },
  }).explain("executionStats");
  const statGeo = geoPlan.executionStats;
  console.log("----------------------------------------------------------------------------------");
  console.log(`2dsphere Index (GEO_NEAR): docsExamined=${statGeo.totalDocsExamined}, time=${statGeo.executionTimeMillis}ms, returned=${statGeo.nReturned}`);

  console.log("\n=======================================================");
  console.log("Benchmark complete. Data recorded for docs/INDEXES.md");
  console.log("=======================================================\n");

  await disconnectDB();
}

runExplainBenchmark().catch((err) => {
  console.error("Explain benchmark failed:", err);
  process.exit(1);
});
