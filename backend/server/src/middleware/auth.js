const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUser = async (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    // For development, check if it's a mock token
    if (
      process.env.NODE_ENV === "development" &&
      token.includes("mock-signature")
    ) {
      // Return the first seeded user for development
      const mockUser = await User.findOne({ email: "john@example.com" }).select(
        "-password"
      );
      return mockUser;
    }

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

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
    console.error("JWT verification error:", error.message);
    return null;
  }
};

module.exports = { getUser };
