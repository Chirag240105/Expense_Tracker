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

export function initChangeStreams() {
  try {
    const isMaster = mongoose.connection.db?.admin?.().command({ isMaster: 1 });
    // Attempt to watch if replica set
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
      // Expected if standalone MongoDB
      console.log("[ChangeStream] Note: Change streams require replica set. Real-time fallback active.");
    });

    const notifStream = Notification.watch([], { fullDocument: "updateLookup" });
    notifStream.on("change", (change) => {
      const fullDoc = change.fullDocument;
      if (fullDoc && fullDoc.userId) {
        broadcastToUser(fullDoc.userId, "notification", fullDoc);
      }
    });
    notifStream.on("error", () => {});
  } catch (err) {
    console.log("[ChangeStream] Standalone mode detected; using in-memory SSE broadcast fallback.");
  }
}
