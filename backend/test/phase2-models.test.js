import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { User, Category, Transaction, Income, Expense, Budget, Goal, AuditLog, Notification } from "../src/models/index.js";

describe("Phase 2 Models & Schema Validation", () => {
  it("Transaction schema uses Decimal128 and getter produces float", () => {
    const tx = new Transaction({
      userId: new mongoose.Types.ObjectId(),
      type: "expense",
      source: "Supermarket",
      amount: "123.45",
      date: new Date(),
    });

    assert.equal(typeof tx.amount, "number");
    assert.equal(tx.amount, 123.45);
    assert.equal(tx.type, "expense");
    const json = tx.toJSON();
    assert.equal(typeof json.amount, "number");
    assert.equal(json.amount, 123.45);
  });

  it("Income and Expense discriminators inherit Transaction base schema", () => {
    const inc = new Income({
      userId: new mongoose.Types.ObjectId(),
      source: "Monthly Salary",
      amount: 5000,
      employer: "Acme Corp",
    });
    assert.equal(inc.type, "income");
    assert.equal(inc.employer, "Acme Corp");
    assert.equal(inc.amount, 5000);

    const exp = new Expense({
      userId: new mongoose.Types.ObjectId(),
      source: "Office Supplies",
      amount: 45.99,
      isTaxDeductible: true,
    });
    assert.equal(exp.type, "expense");
    assert.equal(exp.isTaxDeductible, true);
    assert.equal(exp.amount, 45.99);
  });

  it("Goal model embeds contributions correctly", () => {
    const goal = new Goal({
      userId: new mongoose.Types.ObjectId(),
      title: "Vacation Fund",
      targetAmount: 2000,
      currentAmount: 500,
      contributions: [
        { amount: 200, note: "Initial deposit" },
        { amount: 300, note: "Bonus allocation" },
      ],
    });

    assert.equal(goal.targetAmount, 2000);
    assert.equal(goal.currentAmount, 500);
    assert.equal(goal.contributions.length, 2);
    assert.equal(goal.contributions[0].amount, 200);
    assert.equal(goal.contributions[1].note, "Bonus allocation");
  });

  it("User model toJSON strips password and __v", async () => {
    const user = new User({
      username: "alice",
      email: "alice@example.com",
      password: "secretpassword123",
      preferences: { currency: "EUR" },
    });
    await user.validate();
    const json = user.toJSON();
    assert.equal(json.password, undefined);
    assert.equal(json.email, "alice@example.com");
    assert.equal(json.preferences.currency, "EUR");
  });

  it("AuditLog model defines TTL index and wildcard details index", () => {
    const indexes = AuditLog.schema.indexes();
    const hasTtl = indexes.some(([fields, opts]) => fields.createdAt === 1 && opts.expireAfterSeconds === 7776000);
    assert.ok(hasTtl, "AuditLog should have 90-day TTL index on createdAt");

    const hasWildcard = indexes.some(([fields]) => fields["details.$**"] === 1);
    assert.ok(hasWildcard, "AuditLog should have wildcard index on details.$**");
  });

  it("Notification model defines TTL index and compound unread query index", () => {
    const indexes = Notification.schema.indexes();
    const hasTtl = indexes.some(([fields, opts]) => fields.createdAt === 1 && opts.expireAfterSeconds === 2592000);
    assert.ok(hasTtl, "Notification should have 30-day TTL index on createdAt");

    const hasCompound = indexes.some(([fields]) => fields.userId === 1 && fields.isRead === 1);
    assert.ok(hasCompound, "Notification should have compound index on userId and isRead");
  });
});
