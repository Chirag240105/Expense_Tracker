import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import connectDB from "./src/Database/db.js";
import { initChangeStreams } from "./src/services/changeStreamService.js";
import { notFoundHandler, errorHandler } from "./src/middlewares/errorHandler.js";

// Routes
import authRoutes from "./src/Routes/AuthRoutes.js";
import transactionRoutes from "./src/Routes/transactionRoutes.js";
import incomeRoutes from "./src/Routes/incomeRoutes.js";
import expenseRoutes from "./src/Routes/ExpenseRoutes.js";
import dashboardRoute from "./src/Routes/dashboardRoute.js";
import categoryRoutes from "./src/Routes/categoryRoutes.js";
import budgetRoutes from "./src/Routes/budgetRoutes.js";
import goalRoutes from "./src/Routes/goalRoutes.js";
import analyticsRoutes from "./src/Routes/analyticsRoutes.js";
import fileRoutes from "./src/Routes/fileRoutes.js";
import eventRoutes from "./src/Routes/eventRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security & Parsing Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads (legacy support)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  let isReplicaSet = false;
  let pingOk = false;

  try {
    if (dbState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      pingOk = true;
      const masterInfo = await mongoose.connection.db.admin().command({ isMaster: 1 });
      isReplicaSet = Boolean(masterInfo.setName);
    }
  } catch (e) {
    // Ping failed
  }

  res.status(pingOk ? 200 : 503).json({
    status: pingOk ? "ok" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: states[dbState] || "unknown",
      ping: pingOk ? "pong" : "failed",
      replicaSet: isReplicaSet,
    },
    timestamp: new Date(),
  });
});

// Mount Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/events", eventRoutes);

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Boot server
const port = process.env.PORT || 9000;

export async function startServer() {
  await connectDB();
  initChangeStreams();
  return app.listen(port, () => {
    console.log(`[Server] Expense Tracker API running on port ${port}`);
  });
}

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  startServer().catch((err) => {
    console.error("[Server] Fatal bootstrap error:", err);
    process.exit(1);
  });
}

export default app;
