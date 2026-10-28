import mongoose from "mongoose";

const recurringRuleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
      set: (v) => {
        if (v instanceof mongoose.Types.Decimal128) return v;
        const num = parseFloat(v);
        return mongoose.Types.Decimal128.fromString(isNaN(num) ? "0.00" : num.toFixed(2));
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      default: "monthly",
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    nextRunAt: {
      type: Date,
      required: true,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

// Partial index for scheduler lookup: only index active rules by nextRunAt!
recurringRuleSchema.index(
  { nextRunAt: 1 },
  { partialFilterExpression: { isActive: true } }
);

export const RecurringRule = mongoose.model("RecurringRule", recurringRuleSchema);
export default RecurringRule;
