import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.models.js";
import { Notification } from "../models/Notification.models.js";

// Map of userId -> Set of express res objects
const sseClients = new Map();

export function addSSEClient(userId, res) {
  const idStr = userId.toString();
  if (!sseClients.has(idStr)) {
    sseClients.set(idStr, new Set());
  }
  sseClients.get(idStr).add(res);

  res.on("close", () => {
    const clients = sseClients.get(idStr);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(idStr);
      }
    }
  });
}

export function broadcastToUser(userId, eventName, data) {
  const idStr = userId.toString();
  const clients = sseClients.get(idStr);
  if (!clients || clients.size === 0) return;

  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (e) {
      // Ignore write errors to dead sockets
    }
  }
}

export async function initChangeStreams() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    console.warn("[ChangeStream] MongoDB is not connected; real-time updates are disabled.");
    return false;
  }

  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    if (!hello.setName && hello.msg !== "isdbgrid") {
      console.warn("[ChangeStream] MongoDB is standalone; use a replica set to enable real-time updates.");
      return false;
    }

    const txStream = Transaction.watch([], { fullDocument: "updateLookup" });
    txStream.on("change", (change) => {
      const fullDoc = change.fullDocument;
      if (fullDoc && fullDoc.userId) {
        broadcastToUser(fullDoc.userId, "transaction_change", {
          operationType: change.operationType,
          documentId: change.documentKey._id,
          type: fullDoc.type,
          amount: fullDoc.amount,
          source: fullDoc.source,
        });
      }
    });

    txStream.on("error", (err) => {
      console.error("[ChangeStream] Transaction stream failed; real-time transaction updates are disabled:", err.message);
    });

    const notifStream = Notification.watch([], { fullDocument: "updateLookup" });
    notifStream.on("change", (change) => {
      const fullDoc = change.fullDocument;
      if (fullDoc && fullDoc.userId) {
        broadcastToUser(fullDoc.userId, "notification", fullDoc);
      }
    });
    notifStream.on("error", (err) => {
      console.error("[ChangeStream] Notification stream failed; real-time notifications are disabled:", err.message);
    });
    console.info("[ChangeStream] Transaction and notification streams are active.");
    return true;
  } catch (err) {
    console.error("[ChangeStream] Could not initialize streams; continuing without real-time updates:", err.message);
    return false;
  }
}
