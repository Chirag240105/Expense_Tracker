import express from "express";
import {
  signUp,
  login,
  getUser,
  updateProfile,
  refreshSession,
} from "../Controller/AuthController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.get("/getUser", protect, getUser);
router.get("/me", protect, getUser);
router.put("/update-profile", protect, updateProfile);

export default router;
