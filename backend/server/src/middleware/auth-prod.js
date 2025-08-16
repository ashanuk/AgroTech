/**
 * Production-ready authentication middleware
 * Enhanced security and error handling for production use
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUser = async (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    // In production, we must have a proper JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("ERROR: JWT_SECRET not found in environment variables");
      return null;
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has the expected payload structure
    if (!decoded.userId) {
      console.error("Invalid token payload: missing userId");
      return null;
    }

    // Find the user by ID
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.error("User not found for token userId:", decoded.userId);
      return null;
    }

    return user;
  } catch (error) {
    // More detailed error logging for production
    if (error.name === "JsonWebTokenError") {
      console.error("JWT validation error:", error.message);
    } else if (error.name === "TokenExpiredError") {
      console.error("JWT token expired");
    } else {
      console.error("Authentication error:", error.message);
    }
    return null;
  }
};

module.exports = { getUser };
