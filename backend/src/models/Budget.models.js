import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
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
    period: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      default: () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
      },
    },
    endDate: {
      type: Date,
      default: () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      },
    },
    alertThreshold: {
      type: Number,
      default: 0.8, // 80%
      min: 0.1,
      max: 1.5,
    },
    notificationsSent: {
      type: [Date],
      default: [],
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

budgetSchema.index({ userId: 1, categoryId: 1, period: 1, isActive: 1 });

export const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;

