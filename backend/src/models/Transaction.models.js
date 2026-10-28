import mongoose from "mongoose";

const transactionOptions = {
  discriminatorKey: "type",
  collection: "transactions",
  timestamps: true,
  toJSON: {
    getters: true,
    virtuals: true,
    transform: (_doc, ret) => {
      if (ret.amount !== undefined && ret.amount !== null) {
        ret.amount = parseFloat(ret.amount.toString());
      }
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    getters: true,
    virtuals: true,
  },
};

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (coords) =>
          Array.isArray(coords) &&
          coords.length === 2 &&
          coords[0] >= -180 &&
          coords[0] <= 180 &&
          coords[1] >= -90 &&
          coords[1] <= 90,
        message: "Coordinates must be [longitude, latitude] within valid geographic ranges",
      },
    },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner user ID is required"],
      index: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, "Amount is required"],
      get: (v) => (v ? parseFloat(v.toString()) : 0),
      set: (v) => {
        if (v instanceof mongoose.Types.Decimal128) return v;
        const num = parseFloat(v);
        if (isNaN(num)) return mongoose.Types.Decimal128.fromString("0.00");
        return mongoose.Types.Decimal128.fromString(num.toFixed(2));
      },
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Source or payee is required"],
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
      default: null,
    },
    icon: {
      type: String,
      default: "receipt",
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit_card", "debit_card", "bank_transfer", "crypto", "other"],
      default: "other",
    },
    location: {
      type: pointSchema,
      default: undefined,
    },
    receiptFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringRule",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  transactionOptions
);

// Indexes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1, date: -1 });
transactionSchema.index({ userId: 1, isDeleted: 1, date: -1 });
transactionSchema.index({ location: "2dsphere" });
transactionSchema.index({ source: "text", description: "text", notes: "text", tags: "text" });

export const Transaction = mongoose.model("Transaction", transactionSchema);

// Discriminator models for Income and Expense
export const Income = Transaction.discriminators?.income || Transaction.discriminator(
  "income",
  new mongoose.Schema({
    employer: { type: String, trim: true },
    isTaxable: { type: Boolean, default: true },
  })
);

export const Expense = Transaction.discriminators?.expense || Transaction.discriminator(
  "expense",
  new mongoose.Schema({
    merchant: { type: String, trim: true },
    isTaxDeductible: { type: Boolean, default: false },
  })
);

export default Transaction;
