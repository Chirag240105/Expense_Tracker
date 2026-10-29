import { Income } from "../models/Income.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";
import { createTransactionWorkbook } from "../utils/createTransactionWorkbook.js";

export const addIncome = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { icon, source, amount, date, categoryId, tags, paymentMethod, notes } = req.body;

  if (!source || amount === undefined || amount === null || !date) {
    throw new HttpError(400, "Source, amount, and date are required");
  }

  const newIncome = await Income.create({
    userId,
    icon: icon || "briefcase",
    source,
    amount,
    date: new Date(date),
    categoryId: categoryId || null,
    tags: Array.isArray(tags) ? tags : [],
    paymentMethod: paymentMethod || "other",
    notes: notes || "",
  });

  return res.status(201).json(newIncome);
});

export const getAllIncome = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const income = await Income.find({ userId, isDeleted: false })
    .populate("categoryId", "name color icon")
    .sort({ date: -1 });

  return res.status(200).json(income);
});

export const downloadIncomeExcel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const income = await Income.find({ userId, isDeleted: false }).sort({ date: -1 });

  const buffer = await createTransactionWorkbook("Income", income);

  res.setHeader("Content-Disposition", 'attachment; filename="income_details.xlsx"');
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.send(buffer);
});

export const deleteIncome = asyncHandler(async (req, res) => {
  const result = await Income.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!result) {
    throw new HttpError(404, "Income record not found or unauthorized");
  }

  return res.status(200).json({ success: true, message: "Income deleted successfully" });
});
