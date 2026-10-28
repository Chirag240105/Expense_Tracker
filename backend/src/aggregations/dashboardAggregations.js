import mongoose from "mongoose";

/**
 * Builds the comprehensive single-query $facet aggregation pipeline for the user dashboard.
 * Evaluates lifetime totals, period totals, category distribution, daily trends, and recent transactions.
 */
export function buildDashboardPipeline(userId, startDate = null, endDate = null) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const matchStage = {
    userId: userObjectId,
    isDeleted: false,
  };

  const periodMatch = { ...matchStage };
  if (startDate || endDate) {
    periodMatch.date = {};
    if (startDate) periodMatch.date.$gte = new Date(startDate);
    if (endDate) periodMatch.date.$lte = new Date(endDate);
  } else {
    // Default 30-day window
    periodMatch.date = { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) };
  }

  return [
    { $match: matchStage },
    {
      $facet: {
        // 1. Lifetime totals
        lifetimeTotals: [
          {
            $group: {
              _id: "$type",
              totalAmount: { $sum: { $toDouble: "$amount" } },
              count: { $sum: 1 },
            },
          },
        ],

        // 2. Window/Period totals
        periodTotals: [
          { $match: periodMatch },
          {
            $group: {
              _id: "$type",
              totalAmount: { $sum: { $toDouble: "$amount" } },
              count: { $sum: 1 },
            },
          },
        ],

        // 3. Category spending breakdown (expenses only, with $lookup to Category)
        categorySpending: [
          { $match: { ...periodMatch, type: "expense" } },
          {
            $group: {
              _id: "$categoryId",
              totalAmount: { $sum: { $toDouble: "$amount" } },
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              totalAmount: 1,
              count: 1,
              categoryName: { $ifNull: ["$category.name", "Uncategorized"] },
              categoryColor: { $ifNull: ["$category.color", "#6B7280"] },
              categoryIcon: { $ifNull: ["$category.icon", "tag"] },
            },
          },
          { $sort: { totalAmount: -1 } },
        ],

        // 4. Daily trend history for charts (last 30 days)
        dailyTrends: [
          { $match: periodMatch },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                type: "$type",
              },
              total: { $sum: { $toDouble: "$amount" } },
            },
          },
          { $sort: { "_id.date": 1 } },
        ],

        // 5. Recent 10 transactions with category details
        recentTransactions: [
          { $sort: { date: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              type: 1,
              source: 1,
              amount: { $toDouble: "$amount" },
              currency: 1,
              date: 1,
              icon: 1,
              paymentMethod: 1,
              tags: 1,
              location: 1,
              category: {
                _id: "$category._id",
                name: "$category.name",
                color: "$category.color",
                icon: "$category.icon",
              },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Normalizes raw facet outputs into clean, ready-to-consume frontend JSON.
 */
export function formatDashboardResult(facetResult) {
  const result = facetResult[0] || {};

  let totalIncome = 0;
  let totalExpense = 0;
  for (const item of result.lifetimeTotals || []) {
    if (item._id === "income") totalIncome = item.totalAmount;
    if (item._id === "expense") totalExpense = item.totalAmount;
  }
  const balance = totalIncome - totalExpense;

  let periodIncome = 0;
  let periodExpense = 0;
  for (const item of result.periodTotals || []) {
    if (item._id === "income") periodIncome = item.totalAmount;
    if (item._id === "expense") periodExpense = item.totalAmount;
  }
  const savingsRate = periodIncome > 0 ? Math.max(0, ((periodIncome - periodExpense) / periodIncome) * 100) : 0;

  // Compute percentages for category breakdown
  const categorySpending = (result.categorySpending || []).map((cat) => ({
    ...cat,
    percentage: periodExpense > 0 ? parseFloat(((cat.totalAmount / periodExpense) * 100).toFixed(1)) : 0,
  }));

  return {
    lifetime: {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    },
    period: {
      income: parseFloat(periodIncome.toFixed(2)),
      expense: parseFloat(periodExpense.toFixed(2)),
      savingsRate: parseFloat(savingsRate.toFixed(1)),
    },
    categorySpending,
    dailyTrends: result.dailyTrends || [],
    recentTransactions: result.recentTransactions || [],
  };
}
