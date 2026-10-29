import express from "express";
import {
  signUp,
  login,
  getUser,
  updateProfile,
  refreshSession,
  logout,
} from "../Controller/AuthController.js";
import { protect } from "../middlewares/AuthMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/register", loginRateLimit, signUp);
router.post("/login", loginRateLimit, login);
router.post("/refresh", loginRateLimit, refreshSession);
router.post("/logout", protect, logout);

// Multiple aliases so old code and new code both work
router.get("/getUser", protect, getUser);
router.get("/getInfo", protect, getUser);
router.get("/me", protect, getUser);

router.put("/update-profile", protect, updateProfile);

export default router;
