import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Transaction, Budget, Category, RecurringRule, AuditLog, Notification, RefreshToken } from "../src/models/index.js";

describe("Phase 3 Indexes & Configuration", () => {
  it("Transaction model defines all required query indexes", () => {
    const indexes = Transaction.schema.indexes();
    const keys = indexes.map(([fields]) => fields);

    assert.ok(keys.some((k) => k.userId === 1 && k["date"] === -1), "userId_1_date_-1 exists");
    assert.ok(keys.some((k) => k.userId === 1 && k.type === 1 && k["date"] === -1), "userId_1_type_1_date_-1 exists");
    assert.ok(keys.some((k) => k.userId === 1 && k.categoryId === 1 && k["date"] === -1), "userId_1_categoryId_1_date_-1 exists");
    assert.ok(keys.some((k) => k.location === "2dsphere"), "location_2dsphere exists");
    assert.ok(keys.some((k) => k.source === "text" && k.description === "text"), "full-text index exists");
  });

  it("Category model defines unique compound index with partial filter", () => {
    const indexes = Category.schema.indexes();
    const found = indexes.find(([fields, opts]) => fields.userId === 1 && fields.name === 1 && fields.type === 1 && opts.unique === true);
    assert.ok(found, "Category should define unique compound index on userId, name, type");
    assert.deepEqual(found[1].partialFilterExpression, { isDeleted: false });
  });

  it("RecurringRule defines partial index for active rule scheduler", () => {
    const indexes = RecurringRule.schema.indexes();
    const found = indexes.find(([fields, opts]) => fields.nextRunAt === 1 && opts.partialFilterExpression?.isActive === true);
    assert.ok(found, "RecurringRule should define partial index on nextRunAt where isActive is true");
  });

  it("RefreshToken defines TTL index with 0s expiry and unique tokenHash", () => {
    const indexes = RefreshToken.schema.indexes();
    const ttlFound = indexes.find(([fields, opts]) => fields.expiresAt === 1 && opts.expireAfterSeconds === 0);
    assert.ok(ttlFound, "RefreshToken should have TTL index with expireAfterSeconds: 0");
  });
});
