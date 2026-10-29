import express from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../Controller/categoryController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, createCategory);
router.delete("/:id", protect, deleteCategory);

export default router;

