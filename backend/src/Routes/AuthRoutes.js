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

const router = express.Router();

router.post("/register", signUp);
router.post("/login", login);
router.post("/refresh", refreshSession);
router.post("/logout", protect, logout);

// Multiple aliases so old code and new code both work
router.get("/getUser", protect, getUser);
router.get("/getInfo", protect, getUser);
router.get("/me", protect, getUser);

router.put("/update-profile", protect, updateProfile);

export default router;
