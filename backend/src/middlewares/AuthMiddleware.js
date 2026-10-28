import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_super_secret_jwt_key_2026");
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: "User not found or account deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
  }
};
