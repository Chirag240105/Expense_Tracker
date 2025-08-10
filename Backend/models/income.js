import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    icon:{
        type: String,
    },
    source:{
        type: String,
        required: true
    },//Salary, freelance
    amount:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
}, {timestamps: true})

export const Income = mongoose.model("Income", incomeSchema)