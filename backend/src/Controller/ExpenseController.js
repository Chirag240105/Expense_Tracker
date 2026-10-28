import { Expense } from "../models/Expense.models.js";
import xlsx from "xlsx";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

export const addExpense = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { icon, source, amount, date, categoryId, tags, paymentMethod, notes, location } = req.body;

  if (!source || amount === undefined || amount === null || !date) {
    throw new HttpError(400, "Source, amount, and date are required");
  }

  const newExpense = await Expense.create({
    userId,
    icon: icon || "receipt",
    source,
    amount,
    date: new Date(date),
    categoryId: categoryId || null,
    tags: Array.isArray(tags) ? tags : [],
    paymentMethod: paymentMethod || "other",
    notes: notes || "",
    location: location?.coordinates ? location : undefined,
  });

  return res.status(201).json(newExpense);
});

export const getAllExpense = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const expenses = await Expense.find({ userId, isDeleted: false })
    .populate("categoryId", "name color icon")
    .sort({ date: -1 });

  return res.status(200).json(expenses);
});

export const downloadExpenseExcel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const expenses = await Expense.find({ userId, isDeleted: false }).sort({ date: -1 });

  const data = expenses.map((item) => ({
    Source: item.source,
    Amount: item.amount,
    Date: new Date(item.date).toISOString().split("T")[0],
    Tags: (item.tags || []).join(", "),
    PaymentMethod: item.paymentMethod || "other",
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, "Expense");

  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", 'attachment; filename="expense_details.xlsx"');
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.send(buffer);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const result = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!result) {
    throw new HttpError(404, "Expense record not found or unauthorized");
  }

  return res.status(200).json({ success: true, message: "Expense deleted successfully" });
});
