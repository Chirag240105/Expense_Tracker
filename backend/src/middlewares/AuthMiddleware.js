import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user || user.isDeleted) {
    return res.status(401).json({ success: false, message: "User not found or account deactivated" });
  }

  req.user = user;
  return next();
};
