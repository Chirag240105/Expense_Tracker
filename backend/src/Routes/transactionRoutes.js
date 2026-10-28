import express from "express";
import {
  getTransactionsWithPagination,
  createTransactionWithACID,
  bulkImportTransactions,
  getGeospatialSpending,
} from "../Controller/transactionController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", protect, getTransactionsWithPagination);
router.post("/", protect, createTransactionWithACID);
router.post("/bulk", protect, bulkImportTransactions);
router.get("/nearby", protect, getGeospatialSpending);

export default router;
