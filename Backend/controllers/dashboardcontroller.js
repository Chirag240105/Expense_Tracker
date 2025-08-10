import { Income } from "../models/income.js";
import { Expense } from "../models/expense.js";
import { isValidObjectId, Types } from "mongoose";


export const  getDashboardData = async(req, res) => {
    try{
        const userId = req.user.userId
        const userObjectId = new Types.ObjectId(String(userId))
        

        const totalIncome = await Income.aggregate([
            { $match: {userId: userObjectId}},
            { $group: {_id: null, total: { $sum: "$amount"}}}
        ])

        console.log("totalIncome", {totalIncome, userId: isValidObjectId(userId)})

        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId }},
            { $group: {_id: null ,total: { $sum: "$amount"}}}
        ])

        const last60dayIncomeTransactions = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 *60 * 60 *1000)}
        }).sort({ date: -1})
    

    const incomeLast60Days = last60dayIncomeTransaction.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
    );


    const last30DaysExpenseTransactions = await Expense.find({
        userId,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)},
    }).sort({ date: -1})


    const expensesLast30Days = last30DaysExpenseTransactions.reduce((
        sum, transaction
    ) => sum + transaction.amount,
0
)

const lastTransactions = [
    ...(await Income.find({userId}).sort({ date: -1}).limit(5)).map(
        (txn) => ({
            ...txn.toObject(),
            type:"income",
        })
    ),
    ...(await Expense.find({ userId }).sort({ date : -1}).limit(5)).map(
        (txn) => ({
            ...txn.toObject(),
            type: "expense"
        })
    )
].sort((a, b)=> b.date - a.date)

res.json({
    totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
    totalIncome: totalIncome[0]?.total || 0,
    totalExpense: totalExpense[0]?.total || 0,

    last30DaysExpenseTransactions:{
        total : expensesLast30Days,
        transaction: last30DaysExpenseTransactions
    },
    incomeLast60Days:{
        total: incomeLast60Days,
        transaction: last60dayIncomeTransactions,
    },
    recenttransactions: lastTransactions,
})
    } catch(error){
        res.status(500).json({ message: "server Error", error})
    }
}