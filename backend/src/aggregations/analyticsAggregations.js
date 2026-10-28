import mongoose from "mongoose";

/**
 * Builds monthly trend pipeline using MongoDB 5.0+ $setWindowFields
 * to compute rolling 3-month moving averages and cumulative net savings.
 */
export function buildMonthlyTrendsPipeline(userId, monthsBack = 12) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

  return [
    {
      $match: {
        userId: userObjectId,
        isDeleted: false,
        date: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        totalAmount: { $sum: { $toDouble: "$amount" } },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { year: "$_id.year", month: "$_id.month" },
        income: {
          $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$totalAmount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$totalAmount", 0] },
        },
        transactionCount: { $sum: "$count" },
      },
    },
    {
      $project: {
        _id: 1,
        year: "$_id.year",
        month: "$_id.month",
        monthLabel: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
        income: { $round: ["$income", 2] },
        expense: { $round: ["$expense", 2] },
        netSavings: { $round: [{ $subtract: ["$income", "$expense"] }, 2] },
        transactionCount: 1,
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    // Advanced MongoDB 5.0+ feature: $setWindowFields
    {
      $setWindowFields: {
        sortBy: { "_id.year": 1, "_id.month": 1 },
        output: {
          // 3-month moving average of expenses
          movingAvgExpense: {
            $avg: "$expense",
            window: {
              documents: [-2, 0], // Previous 2 documents + current document
            },
          },
          // Cumulative running net balance over time
          cumulativeSavings: {
            $sum: "$netSavings",
            window: {
              documents: ["unbounded", "current"],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: 1,
        month: 1,
        monthLabel: 1,
        income: 1,
        expense: 1,
        netSavings: 1,
        movingAvgExpense: { $round: ["$movingAvgExpense", 2] },
        cumulativeSavings: { $round: ["$cumulativeSavings", 2] },
        transactionCount: 1,
      },
    },
  ];
}

/**
 * Builds aggregation for payment method and tag breakdown.
 */
export function buildPaymentAndTagPipeline(userId) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return [
    {
      $match: {
        userId: userObjectId,
        isDeleted: false,
        type: "expense",
      },
    },
    {
      $facet: {
        byPaymentMethod: [
          {
            $group: {
              _id: "$paymentMethod",
              totalAmount: { $sum: { $toDouble: "$amount" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { totalAmount: -1 } },
        ],
        byTag: [
          { $unwind: "$tags" },
          {
            $group: {
              _id: "$tags",
              totalAmount: { $sum: { $toDouble: "$amount" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { totalAmount: -1 } },
          { $limit: 15 },
        ],
      },
    },
  ];
}
