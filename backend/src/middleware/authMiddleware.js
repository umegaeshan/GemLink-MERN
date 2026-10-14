import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.get("Authorization") || "";
  const parts = authHeader.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== "bearer" ||
    !parts[1]
  ) {
    return res.status(401).json({
      message: "Please log in to continue.",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 64) {
    return res.status(500).json({
      message: "Authentication is temporarily unavailable.",
    });
  }

  try {
    const decoded = jwt.verify(parts[1], secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded.userId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(decoded.userId) ||
      typeof decoded.exp !== "number"
    ) {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }

    const user = await User.findById(decoded.userId)
      .select("_id name email role");

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please log in again.",
      });
    }

    req.user = user;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }

    console.error("Authentication failed:", error.name);

    return res.status(500).json({
      message: "Unable to authenticate. Please try again later.",
    });
  }

  next();
}
