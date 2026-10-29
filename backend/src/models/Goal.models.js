import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  { _id: true, timestamps: false }
);

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: 120,
    },
    targetAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
      set: (v) => {
        if (v instanceof mongoose.Types.Decimal128) return v;
        const num = parseFloat(v);
        return mongoose.Types.Decimal128.fromString(isNaN(num) ? "0.00" : num.toFixed(2));
      },
    },
    currentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
      set: (v) => {
        if (v instanceof mongoose.Types.Decimal128) return v;
        const num = parseFloat(v);
        return mongoose.Types.Decimal128.fromString(isNaN(num) ? "0.00" : num.toFixed(2));
      },
    },
    deadline: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    color: {
      type: String,
      default: "#10B981",
    },
    icon: {
      type: String,
      default: "target",
    },
    contributions: {
      type: [contributionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["in_progress", "achieved", "abandoned"],
      default: "in_progress",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model("Goal", goalSchema);
export default Goal;

