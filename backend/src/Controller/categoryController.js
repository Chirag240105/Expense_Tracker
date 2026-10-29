import { Category } from "../models/Category.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    $or: [{ userId: req.user._id }, { userId: null }],
    isDeleted: false,
  }).sort({ isDefault: -1, name: 1 });

  return res.status(200).json({
    success: true,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;
  if (!name || !type) {
    throw new HttpError(400, "Name and type ('income' or 'expense') are required");
  }

  const category = await Category.create({
    userId: req.user._id,
    name,
    type,
    color: color || "#4F46E5",
    icon: icon || "tag",
    isDefault: false,
  });

  return res.status(201).json({
    success: true,
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!category) {
    throw new HttpError(404, "Category not found or cannot delete system default");
  }

  category.isDeleted = true;
  await category.save();

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

