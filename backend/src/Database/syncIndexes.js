import {
  User,
  Category,
  Transaction,
  Budget,
  Goal,
  RecurringRule,
  AuditLog,
  Notification,
  RefreshToken,
} from "../models/index.js";

const models = [
  User,
  Category,
  Transaction,
  Budget,
  Goal,
  RecurringRule,
  AuditLog,
  Notification,
  RefreshToken,
];

export async function syncAllIndexes() {
  const results = {};
  for (const model of models) {
    try {
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      results[model.modelName] = indexes.map((idx) => ({
        name: idx.name,
        key: idx.key,
        unique: !!idx.unique,
        expireAfterSeconds: idx.expireAfterSeconds,
        partialFilterExpression: idx.partialFilterExpression,
      }));
    } catch (err) {
      console.warn(`[IndexSync] Warning on ${model.modelName}:`, err.message);
      results[model.modelName] = { error: err.message };
    }
  }
  return results;
}

export default syncAllIndexes;
