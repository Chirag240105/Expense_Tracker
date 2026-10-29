import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.models.js";
import { RefreshToken } from "../models/RefreshToken.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_2026";
const ACCESS_EXPIRY = "1h";
const REFRESH_DAYS = 7;
const IS_PROD = process.env.NODE_ENV === "production";

// ── Token helpers ─────────────────────────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });

const createRefreshToken = async (userId) => {
  const tokenString = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(tokenString).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, tokenHash, expiresAt });
  return tokenString;
};

/** Write the refresh token as an httpOnly cookie (not readable by JS) */
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: IS_PROD,           // HTTPS only in production
    sameSite: "lax",           // allows cross-site redirects, blocks CSRF
    path: "/api/auth",         // only sent to auth endpoints
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
  });
};

// ── Controllers ───────────────────────────────────────────────────────────────

export const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new HttpError(400, "Username, email, and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) throw new HttpError(400, "Email already in use");

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    token: accessToken,        // keep "token" key — frontend reads this
    user: user.toJSON(),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.isDeleted || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    token: accessToken,        // keep "token" key — frontend reads this
    user: user.toJSON(),
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user || user.isDeleted) throw new HttpError(404, "User not found");
  return res.status(200).json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, preferences, profileImageUrl } = req.body;
  const user = await User.findById(req.user._id);
  if (!user || user.isDeleted) throw new HttpError(404, "User not found");

  if (username) user.username = username.trim();
  if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;
  if (preferences) {
    user.preferences = { ...(user.preferences?.toObject?.() ?? {}), ...preferences };
  }

  await user.save();
  return res.status(200).json({ success: true, user: user.toJSON() });
});

export const refreshSession = asyncHandler(async (req, res) => {
  // Accept token from httpOnly cookie OR request body (for clients that can't use cookies)
  const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!rawToken) throw new HttpError(400, "Refresh token required");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const storedToken = await RefreshToken.findOne({ tokenHash });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid or expired refresh token");
  }

  // Rotate — delete the used token
  await RefreshToken.deleteOne({ _id: storedToken._id });

  const user = await User.findById(storedToken.userId);
  if (!user || user.isDeleted) throw new HttpError(401, "User no longer active");

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = await createRefreshToken(user._id);
  setRefreshCookie(res, newRefreshToken);

  return res.status(200).json({
    success: true,
    token: newAccessToken,
    user: user.toJSON(),
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (rawToken) {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await RefreshToken.deleteOne({ tokenHash });
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  return res.status(200).json({ success: true, message: "Logged out" });
});
