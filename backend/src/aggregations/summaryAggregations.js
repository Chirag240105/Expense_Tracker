import mongoose from "mongoose";

/**
 * Builds pipeline to compute and $merge monthly user summaries into 'monthly_summaries' collection.
 * Demonstrates MongoDB's $merge stage for on-demand summary materialization.
 */
export function buildMaterializeSummaryPipeline(userId) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return [
    {
      $match: {
        userId: userObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, { $toDouble: "$amount" }, 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $toDouble: "$amount" }, 0] },
        },
        transactionCount: { $sum: 1 },
        lastUpdated: { $max: "$updatedAt" },
      },
    },
    {
      $project: {
        _id: {
          $concat: [
            { $toString: "$_id.userId" },
            "_",
            { $toString: "$_id.year" },
            "_",
            { $toString: "$_id.month" },
          ],
        },
        userId: "$_id.userId",
        year: "$_id.year",
        month: "$_id.month",
        totalIncome: { $round: ["$totalIncome", 2] },
        totalExpense: { $round: ["$totalExpense", 2] },
        netSavings: { $round: [{ $subtract: ["$totalIncome", "$totalExpense"] }, 2] },
        transactionCount: "$transactionCount",
        lastCalculatedAt: new Date(),
      },
    },
    {
      $merge: {
        into: "monthly_summaries",
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    },
  ];
}

