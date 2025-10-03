import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import { addIncome, deleteIncome, downloadIncomeExcel, getAllIncome } from "../Controller/IncomeController.js";

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);

export default router;