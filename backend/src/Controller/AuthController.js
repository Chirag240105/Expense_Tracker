import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.models.js";
import { RefreshToken } from "../models/RefreshToken.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_2026";
const ACCESS_EXPIRY = "1h";
const REFRESH_DAYS = 7;

const generateAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

const createRefreshToken = async (userId) => {
  const tokenString = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(tokenString).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return tokenString;
};

export const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new HttpError(400, "Username, email, and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new HttpError(400, "Email already in use");
  }

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  return res.status(201).json({
    success: true,
    id: user._id,
    user,
    token: accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.isDeleted || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  return res.status(200).json({
    success: true,
    id: user._id,
    user,
    token: accessToken,
    refreshToken,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user || user.isDeleted) {
    throw new HttpError(404, "User not found");
  }
  return res.status(200).json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, preferences, profileImageUrl } = req.body;
  const user = await User.findById(req.user._id);
  if (!user || user.isDeleted) {
    throw new HttpError(404, "User not found");
  }

  if (username) user.username = username.trim();
  if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;
  if (preferences) {
    user.preferences = {
      ...user.preferences?.toObject(),
      ...preferences,
    };
  }

  await user.save();
  return res.status(200).json({
    success: true,
    user,
  });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token required");
  }

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const storedToken = await RefreshToken.findOne({ tokenHash });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid or expired refresh token");
  }

  // Token rotation: delete used token
  await RefreshToken.deleteOne({ _id: storedToken._id });
  const user = await User.findById(storedToken.userId);
  if (!user || user.isDeleted) {
    throw new HttpError(401, "User no longer active");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = await createRefreshToken(user._id);

  return res.status(200).json({
    success: true,
    token: newAccessToken,
    refreshToken: newRefreshToken,
  });
});
