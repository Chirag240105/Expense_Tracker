import express from "express";
import {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
} from "../Controller/ExpenseController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.get("/download-excel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

export default router;
