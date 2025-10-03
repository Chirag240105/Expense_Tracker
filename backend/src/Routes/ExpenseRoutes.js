import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import { addExpense, deleteExpense, downloadExpenseExcel, getAllExpense } from "../Controller/ExpenseController.js";


const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

export default router;