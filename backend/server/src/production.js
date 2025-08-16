/**
 * Production-ready entry point for AgroTech Forum API
 * Configured for deployment on Render or similar platforms
 */

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./resolvers");
const connectDB = require("./config/database");
const { getUser } = require("./middleware/auth");
const createLoaders = require("./loaders");
const { upload } = require("./middleware/upload");

// Log startup information
console.log(`Starting server in ${process.env.NODE_ENV || "development"} mode`);
console.log(
  `Using MongoDB: ${
    process.env.MONGODB_URI ? "Remote database" : "Default connection"
  }`
);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    const app = express();

    // Configure CORS for production
    // In production, either use the CORS_ORIGIN env var or allow all origins with "*"
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || "*", // More permissive in production
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "apollo-require-preflight",
      ],
    };

    console.log(`CORS configured with origin: ${corsOptions.origin}`);
    app.use(cors(corsOptions));

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        // Get user from token
        const user = await getUser(req);
        // Create fresh loaders for this request
        const loaders = createLoaders();
        return { user, loaders };
      },
      formatError: (error) => {
        console.error("GraphQL Error:", error);
        return {
          message: error.message,
          code: error.extensions?.code,
          path: error.path,
        };
      },
      // Enable introspection in production for client queries
      introspection: true,
    });

    await server.start();
    server.applyMiddleware({
      app,
      path: "/graphql",
      cors: false, // Disable Apollo Server's CORS as we handle it with Express
    });

    // File upload endpoint
    app.post("/upload", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.file;

        // Validate file type
        if (!file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ error: "Only image files are allowed" });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${file.originalname}`;

        // In production, we always use Cloudinary
        const { uploadToCloudinary } = require("./middleware/upload");

        try {
          const imageUrl = await uploadToCloudinary(
            file.buffer,
            uniqueFilename
          );
          res.json({ imageUrl });
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          res.status(500).json({ error: "Image upload failed" });
        }
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed: " + error.message });
      }
    });

    // Health check endpoint (required by many hosting platforms)
    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "AgroTech Forum API",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });

    // Start the server
    const PORT = process.env.PORT || 4001;

    app.listen(PORT, () => {
      const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 GraphQL endpoint: ${baseUrl}/graphql`);
    });

    console.log("Server started successfully");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
