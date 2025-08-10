import { Expense } from "../models/expense.js";
import xlsx from "xlsx"
//add income
export const addExpense = async(req, res) => {
    const userId = req.user.id;

    try{
        const {icon, category, amount, date} = req.body

        if (!category || !amount || !date){
            return res.status(400).json({message: "All fields are required"})
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save()
        res.status(200).json(newExpense)
    }catch (error) {
        res.status(500).json({message: "Server error"})
    }
}

//Get all income
export const getAllExpense = async(req, res) => {
    const userId = req.user.id;

    try{
       const expense = await Expense.find({ userId }).sort({ date: -1 });

        res.json(expense)
    } catch (error) {
        res.status(500).json({ message: "Server error"})
    }

}

//Delete Income
export const deleteExpense = async(req, res) => {
    const userId = req.user.id;

    try{
        await Expense.findByIdAndDelete(req.params.id)
        res.json({ message : " Income deleted successfully"})
    }catch (err){
        res.status(500).json({ message: "Server error : ", err})
    }
}

//download Excel
export const downloadExpenseExcel = async(req, res) => {
    const userId = req.user.id
    try{
        const expense = await Expense.find({ userId }).sort({ date: -1 })

        const data = expense.map((item) => ({
            source: item.source,
            amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb, ws, "Expense")
        res.download('expense_details.xlsx')
    }catch (error){
        res.status(500).json({ message: "Server error"})
    }
}