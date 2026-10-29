import mongoose from "mongoose";

/**
 * Evaluates active user budgets against actual transactions in real-time using aggregation.
 */
export function buildBudgetTrackingPipeline(userId) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return [
    {
      $match: {
        userId: userObjectId,
        isActive: true,
      },
    },
    // Lookup the Category details
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    // Lookup matching expense transactions within the budget date window
    {
      $lookup: {
        from: "transactions",
        let: {
          catId: "$categoryId",
          bStart: "$startDate",
          bEnd: "$endDate",
          bUser: "$userId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$bUser"] },
                  { $eq: ["$type", "expense"] },
                  { $eq: ["$categoryId", "$$catId"] },
                  { $eq: ["$isDeleted", false] },
                  { $gte: ["$date", "$$bStart"] },
                  { $lte: ["$date", "$$bEnd"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: { $toDouble: "$amount" } },
              transactionCount: { $sum: 1 },
            },
          },
        ],
        as: "spendingData",
      },
    },
    {
      $unwind: {
        path: "$spendingData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        categoryId: 1,
        categoryName: "$category.name",
        categoryColor: "$category.color",
        categoryIcon: "$category.icon",
        budgetLimit: { $toDouble: "$amount" },
        spent: { $ifNull: ["$spendingData.totalSpent", 0] },
        transactionCount: { $ifNull: ["$spendingData.transactionCount", 0] },
        period: 1,
        startDate: 1,
        endDate: 1,
        alertThreshold: 1,
      },
    },
    {
      $project: {
        _id: 1,
        categoryId: 1,
        categoryName: 1,
        categoryColor: 1,
        categoryIcon: 1,
        budgetLimit: { $round: ["$budgetLimit", 2] },
        spent: { $round: ["$spent", 2] },
        remaining: { $round: [{ $subtract: ["$budgetLimit", "$spent"] }, 2] },
        percentageUsed: {
          $round: [
            {
              $cond: [
                { $gt: ["$budgetLimit", 0] },
                { $multiply: [{ $divide: ["$spent", "$budgetLimit"] }, 100] },
                0,
              ],
            },
            1,
          ],
        },
        alertStatus: {
          $cond: [
            { $gt: ["$spent", "$budgetLimit"] },
            "exceeded",
            {
              $cond: [
                {
                  $gte: [
                    "$spent",
                    { $multiply: ["$budgetLimit", "$alertThreshold"] },
                  ],
                },
                "warning",
                "normal",
              ],
            },
          ],
        },
        period: 1,
        startDate: 1,
        endDate: 1,
        alertThreshold: 1,
      },
    },
    { $sort: { percentageUsed: -1 } },
  ];
}

