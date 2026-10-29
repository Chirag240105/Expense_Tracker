import express from "express";
import jwt from "jsonwebtoken";
import { addSSEClient } from "../services/changeStreamService.js";

const router = express.Router();

router.get("/stream", (req, res) => {
  // SSE can receive token via query parameter or header
  const token = req.query.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication required for event stream" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_super_secret_jwt_key_2026");
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Set SSE Headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 20000);

  addSSEClient(decoded.id, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ userId: decoded.id, time: new Date() })}\n\n`);

  req.on("close", () => {
    clearInterval(heartbeat);
  });
});

export default router;

