/**
 * Production database connection module
 * Handles MongoDB connection with production-ready error handling
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Set up mongoose options for production
mongoose.set("strictQuery", true);

const connectDB = async () => {
  // Log connection attempt
  console.log("Attempting to connect to MongoDB...");

  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI) {
    console.error(
      "ERROR: MongoDB connection URI not found in environment variables"
    );
    console.error("Please set MONGODB_URI in your environment or .env file");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Production-specific settings
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Set up connection error handlers
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to application termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
