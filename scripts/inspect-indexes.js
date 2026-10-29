import dotenv from "dotenv";
import connectDB, { disconnectDB } from "../backend/src/Database/db.js";
import { syncAllIndexes } from "../backend/src/Database/syncIndexes.js";

dotenv.config();

async function run() {
  console.log("\n========================================");
  console.log("   MongoDB Index Inspector & Synchronizer");
  console.log("========================================\n");

  await connectDB();
  const summary = await syncAllIndexes();

  for (const [modelName, indexes] of Object.entries(summary)) {
    console.log(`\n📦 Collection: ${modelName}`);
    if (indexes.error) {
      console.log(`   ❌ Error: ${indexes.error}`);
      continue;
    }
    for (const idx of indexes) {
      const keys = Object.entries(idx.key)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      const flags = [];
      if (idx.unique) flags.push("UNIQUE");
      if (idx.expireAfterSeconds !== undefined) flags.push(`TTL: ${idx.expireAfterSeconds}s`);
      if (idx.partialFilterExpression) flags.push(`PARTIAL: ${JSON.stringify(idx.partialFilterExpression)}`);

      console.log(`   - [${idx.name}] { ${keys} } ${flags.length ? `(${flags.join(", ")})` : ""}`);
    }
  }

  console.log("\n========================================");
  console.log("Index inspection complete.");
  console.log("========================================\n");
  await disconnectDB();
}

run().catch((err) => {
  console.error("Index inspection failed:", err);
  process.exit(1);
});

