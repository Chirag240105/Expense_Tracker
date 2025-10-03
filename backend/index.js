import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/Database/db.js";
import cors from "cors";
import router from "./src/Routes/AuthRoutes.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import incomeRoute from "./src/Routes/incomeRoutes.js"
import expenseRoute from "./src/Routes/ExpenseRoutes.js"
import dashboardRoute from "./src/Routes/dashboardRoute.js"

dotenv.config();
const app = express();

const __filename =fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
})
);

app.use(express.json());
app.use("/api/auth", router);
app.use("/api/income",incomeRoute);
app.use("/api/expense",expenseRoute);
app.use("/api/dashboard", dashboardRoute);
// app.use("api/forgot-password", ForgetPass);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

const port = process.env.PORT || 9000;
app.listen(port, ()=>{
    console.log(`Server is running on port || ${port}`);
})