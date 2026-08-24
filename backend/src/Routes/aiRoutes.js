import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import axios from "axios";

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";


router.get("/predict-expense", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await axios.get(`${AI_SERVICE_URL}/api/ai/predict-expense/${userId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error calling AI service:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to get expense prediction" 
        });
    }
});

// Get spending analysis
router.get("/analyze-spending", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await axios.get(`${AI_SERVICE_URL}/api/ai/analyze-spending/${userId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error calling AI service:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to analyze spending" 
        });
    }
});

// Get recommendations
router.get("/recommendations", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await axios.get(`${AI_SERVICE_URL}/api/ai/recommendations/${userId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error calling AI service:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to get recommendations" 
        });
    }
});

export default router;
