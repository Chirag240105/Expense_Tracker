import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: new URL("../backend/.env", import.meta.url) });
dotenv.config({ path: new URL("../.env", import.meta.url), override: false });

const apiBaseUrl = (process.env.API_BASE_URL || process.env.VITE_API_URL || "http://localhost:9000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");
const email = process.env.SMOKE_EMAIL || "demo@expensetracker.dev";
const password = process.env.SMOKE_PASSWORD || "Demo@12345";
const headers = { "Content-Type": "application/json" };
const results = [];

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  results.push({ path, status: response.status });
  console.log(`[Smoke] ${response.status} ${method} ${path}`);
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  await request("/api/health");
  const login = await request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!login?.token) throw new Error("Login response did not contain an access token");
  const token = login.token;

  const profile = await request("/api/auth/getInfo", { token });
  const endpoints = [
    "/api/dashboard",
    "/api/transactions?limit=1",
    "/api/transactions/nearby?lat=40.7500&lng=-73.9800&maxDistance=10000",
    "/api/income/get",
    "/api/expense/get",
    "/api/income/download-excel",
    "/api/expense/download-excel",
    "/api/categories",
    "/api/budgets",
    "/api/goals",
    "/api/analytics/trends",
    "/api/analytics/breakdown",
    "/api/notifications",
    "/api/recurring-rules",
  ];
  for (const path of endpoints) await request(path, { token });

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to report smoke-test collection counts");
  }
  await mongoose.connect(process.env.MONGO_URI);

  await request("/api/auth/update-profile", {
    method: "PUT",
    token,
    body: { username: profile.username, email: profile.email },
  });

  const importedSource = `Smoke import ${Date.now()}`;
  let importedTransactionId;
  try {
    await request("/api/transactions/bulk", {
      method: "POST",
      token,
      body: {
        transactions: [{
          source: importedSource,
          amount: 0.01,
          type: "expense",
          date: new Date().toISOString(),
        }],
      },
    });
    const imported = await request(
      `/api/transactions?search=${encodeURIComponent(importedSource)}&limit=10`,
      { token },
    );
    importedTransactionId = imported.data?.find((item) => item.source === importedSource)?._id;
    if (!importedTransactionId) throw new Error("Bulk-imported transaction was not returned by search");
  } finally {
    try {
      if (importedTransactionId) {
        await request(`/api/transactions/${importedTransactionId}`, {
          method: "DELETE",
          token,
        });
      }
    } finally {
      await mongoose.connection.db.collection("transactions").deleteOne({
        ...(importedTransactionId ? { _id: new mongoose.Types.ObjectId(importedTransactionId) } : {}),
        userId: new mongoose.Types.ObjectId(login.user._id),
        source: importedSource,
      });
    }
  }

  const collectionNames = [
    "users",
    "categories",
    "transactions",
    "budgets",
    "goals",
    "recurringrules",
    "notifications",
    "auditlogs",
    "monthly_summaries",
  ];
  const counts = {};
  for (const name of collectionNames) {
    counts[name] = await mongoose.connection.db.collection(name).countDocuments();
  }
  console.log("[Smoke] Collection counts:", JSON.stringify(counts));
  await request("/api/auth/logout", { method: "POST", token });
  console.log(`[Smoke] Passed ${results.length} HTTP checks.`);
}

main()
  .catch((error) => {
    console.error("[Smoke] FAILED:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
