import mongoose from "mongoose";

let isConnecting = false;

export const connectDB = async (uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker") => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) return;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 5,
    });

    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (${conn.connection.host})`);
    isConnecting = false;
    return conn;
  } catch (err) {
    isConnecting = false;
    console.error("[MongoDB] Connection error:", err.message);
    throw err;
  }
};

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database");
});

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("[MongoDB] Disconnected cleanly");
  }
};

export default connectDB;
