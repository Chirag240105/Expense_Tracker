/**
 * AI proxy routes — forward requests from the Express API to the FastAPI AI service.
 *
 * Provider priority (handled inside ai_services/main.py):
 *   1. Google Gemini  (GEMINI_API_KEY)
 *   2. OpenAI GPT     (OPENAI_API_KEY)
 *   3. Rule-based local fallback (no key required)
 *
 * Routes only mount when process.env.ENABLE_AI_ROUTES === "true"
 * (or when AI_SERVICE_URL is explicitly set), so a missing Python
 * service never crashes the main API.
 */

import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import axios from "axios";

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_TIMEOUT_MS = 15_000; // 15 s — ML inference can be slow

/** Shared error handler for all proxy calls */
function handleAIError(res, error, endpoint) {
  console.error(`[AI Proxy] ${endpoint} failed:`, error.message);
  const status = error.response?.status || 503;
  const detail = error.response?.data?.detail || "AI service unavailable";
  return res.status(status).json({ success: false, message: detail });
}

// ── Predict next month's expense ─────────────────────────────────────────────
router.get("/predict-expense", protect, async (req, res) => {
  try {
    const { data } = await axios.get(
      `${AI_SERVICE_URL}/api/ai/predict-expense/${req.user._id}`,
      { timeout: AI_TIMEOUT_MS }
    );
    res.json(data);
  } catch (err) {
    handleAIError(res, err, "predict-expense");
  }
});

// ── Spending analysis + clustering ───────────────────────────────────────────
router.get("/analyze-spending", protect, async (req, res) => {
  try {
    const { data } = await axios.get(
      `${AI_SERVICE_URL}/api/ai/analyze-spending/${req.user._id}`,
      { timeout: AI_TIMEOUT_MS }
    );
    res.json(data);
  } catch (err) {
    handleAIError(res, err, "analyze-spending");
  }
});

// ── Personalised recommendations ─────────────────────────────────────────────
router.get("/recommendations", protect, async (req, res) => {
  try {
    const { data } = await axios.get(
      `${AI_SERVICE_URL}/api/ai/recommendations/${req.user._id}`,
      { timeout: AI_TIMEOUT_MS }
    );
    res.json(data);
  } catch (err) {
    handleAIError(res, err, "recommendations");
  }
});

// ── Chatbot (Gemini → OpenAI → local) ────────────────────────────────────────
router.post("/chat", protect, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: "message is required" });
  }
  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}/api/ai/chat`,
      null, // FastAPI uses query params for this endpoint
      {
        params: { user_id: String(req.user._id), message },
        timeout: AI_TIMEOUT_MS,
      }
    );
    res.json(data);
  } catch (err) {
    handleAIError(res, err, "chat");
  }
});

export default router;
