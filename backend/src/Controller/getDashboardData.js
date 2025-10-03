import { Types, isValidObjectId } from "mongoose";
import { Income } from "../models/Income.models.js";
import { Expense } from "../models/Expense.models.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const userObjectId = new Types.ObjectId(userId);

   
    const [totalIncomeResult] = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = totalIncomeResult?.total || 0;

    const [totalExpenseResult] = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = totalExpenseResult?.total || 0;

  
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: -1 });

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    
    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    const expenseLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    const lastIncome = await Income.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);

    const lastExpense = await Expense.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);

    const recentTransaction = [
      ...lastIncome.map(txn => ({ ...txn.toObject(), type: "income" })),
      ...lastExpense.map(txn => ({ ...txn.toObject(), type: "expense" }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); 

  
    return res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      last30DaysExpense: {
        total: expenseLast30Days,
        transactions: last30DaysExpenseTransactions
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions
      },
      recentTransaction
    });
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
