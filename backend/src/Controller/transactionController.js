import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.models.js";
import { Goal } from "../models/Goal.models.js";
import { withTransaction } from "../Database/transactionHelper.js";
import { broadcastToUser } from "../services/changeStreamService.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

/**
 * Keyset / cursor-based transaction listing with compound filtering.
 */
export const getTransactionsWithPagination = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const { type, categoryId, search, startDate, endDate, minAmount, maxAmount, cursor } = req.query;

  const query = {
    userId,
    isDeleted: false,
  };

  if (type && ["income", "expense"].includes(type)) {
    query.type = type;
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }
  if (search) {
    query.$text = { $search: search };
  }
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = mongoose.Types.Decimal128.fromString(parseFloat(minAmount).toFixed(2));
    if (maxAmount) query.amount.$lte = mongoose.Types.Decimal128.fromString(parseFloat(maxAmount).toFixed(2));
  }

  // Keyset cursor handling: cursor is base64 encoded `{ date, _id }`
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
      query.$or = [
        { date: { $lt: new Date(decoded.date) } },
        {
          date: new Date(decoded.date),
          _id: { $lt: new mongoose.Types.ObjectId(decoded._id) },
        },
      ];
    } catch (e) {
      // Ignore invalid cursor format
    }
  }

  const items = await Transaction.find(query)
    .sort({ date: -1, _id: -1 })
    .limit(limit + 1)
    .populate("categoryId", "name color icon");

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, limit) : items;

  let nextCursor = null;
  if (hasMore && results.length > 0) {
    const lastItem = results[results.length - 1];
    nextCursor = Buffer.from(
      JSON.stringify({ date: lastItem.date, _id: lastItem._id })
    ).toString("base64");
  }

  const totalCount = await Transaction.countDocuments({ userId, isDeleted: false });

  return res.status(200).json({
    success: true,
    data: results,
    pagination: {
      hasMore,
      nextCursor,
      count: results.length,
      totalCount,
    },
  });
});

/**
 * Creates a transaction atomically with ACID guarantees (e.g. updating a goal contribution).
 */
export const createTransactionWithACID = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    type,
    amount,
    source,
    description,
    categoryId,
    date,
    tags,
    paymentMethod,
    location,
    receiptFileId,
    goalId,
  } = req.body;

  if (!type || !amount || !source) {
    throw new HttpError(400, "Type, amount, and source are required");
  }

  const result = await withTransaction(async (session) => {
    const sessionOption = session ? { session } : {};

    const txDocs = await Transaction.create(
      [
        {
          userId,
          type,
          amount,
          source,
          description,
          categoryId: categoryId || null,
          date: date ? new Date(date) : new Date(),
          tags: Array.isArray(tags) ? tags : [],
          paymentMethod: paymentMethod || "other",
          location: location?.coordinates ? location : undefined,
          receiptFileId: receiptFileId || null,
        },
      ],
      sessionOption
    );
    const tx = txDocs[0];

    // Atomically link to goal if requested
    if (goalId) {
      const numAmount = parseFloat(amount);
      const goal = await Goal.findOne({ _id: goalId, userId }, null, sessionOption);
      if (goal) {
        goal.contributions.push({
          amount: numAmount,
          note: `Linked to: ${source}`,
          transactionId: tx._id,
          date: tx.date,
        });
        goal.currentAmount = (goal.currentAmount || 0) + numAmount;
        if (goal.currentAmount >= goal.targetAmount) {
          goal.status = "achieved";
        }
        await goal.save(sessionOption);
      }
    }

    return tx;
  });

  broadcastToUser(userId, "transaction_created", result);

  return res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * Bulk import transactions using Transaction.bulkWrite()
 */
export const bulkImportTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new HttpError(400, "Array of transactions required");
  }

  const operations = transactions.map((item) => ({
    insertOne: {
      document: {
        userId,
        type: item.type || "expense",
        amount: mongoose.Types.Decimal128.fromString(parseFloat(item.amount || 0).toFixed(2)),
        source: item.source || "Imported Transaction",
        description: item.description || "",
        categoryId: item.categoryId || null,
        date: item.date ? new Date(item.date) : new Date(),
        tags: Array.isArray(item.tags) ? item.tags : [],
        paymentMethod: item.paymentMethod || "other",
        isDeleted: false,
      },
    },
  }));

  const bulkResult = await Transaction.bulkWrite(operations, { ordered: false });

  return res.status(200).json({
    success: true,
    message: `Bulk import completed: ${bulkResult.insertedCount} inserted`,
    insertedCount: bulkResult.insertedCount,
  });
});

/**
 * Geospatial spending query ($nearSphere / $geoNear)
 */
export const getGeospatialSpending = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDistance = parseInt(req.query.maxDistance, 10) || 10000; // 10km default

  if (isNaN(lng) || isNaN(lat)) {
    throw new HttpError(400, "Valid lng and lat query parameters required");
  }

  const transactions = await Transaction.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distanceMeters",
        maxDistance,
        query: { userId, isDeleted: false },
        spherical: true,
      },
    },
    { $limit: 50 },
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
        date: 1,
        distanceMeters: { $round: ["$distanceMeters", 0] },
        location: 1,
        categoryName: "$category.name",
        categoryColor: "$category.color",
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    data: transactions,
  });
});
