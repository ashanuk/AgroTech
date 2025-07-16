const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUser = async (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    // Check for mock token (development mode)
    if (token.includes("mock-signature")) {
      // Return the first seeded user for development
      const mockUser = await User.findOne({ email: "john@example.com" }).select(
        "-password"
      );
      return mockUser;
    }

    const { userId } = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(userId).select("-password");
    return user;
  } catch (error) {
    return null;
  }
};

module.exports = { getUser };
