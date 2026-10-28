import express from "express";
import {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} from "../Controller/IncomeController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.get("/download-excel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);

export default router;
