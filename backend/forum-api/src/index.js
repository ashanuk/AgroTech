const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
require("dotenv").config();

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./resolvers");
const connectDB = require("./config/database");
const { getUser } = require("./middleware/auth");
const createLoaders = require("./loaders");

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
