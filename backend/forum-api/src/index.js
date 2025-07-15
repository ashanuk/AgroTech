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

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const app = express();

  // Enable CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );

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
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql", cors: false });

  // File upload endpoint
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.originalname}`;
      
      // Upload to Cloudinary or local storage
      let imageUrl;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const { uploadToCloudinary } = require('./middleware/upload');
        imageUrl = await uploadToCloudinary(file.buffer, uniqueFilename);
      } else {
        const { uploadLocally } = require('./middleware/upload');
        imageUrl = await uploadLocally(file.buffer, uniqueFilename);
      }
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });

  // Serve static files (for uploaded images)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "AgroTech Forum API" });
  });

  const PORT = process.env.PORT || 4001;

  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `📊 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
