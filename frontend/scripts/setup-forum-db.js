/**
 * Database migration script for AgroTech Forum
 * Run this script to set up the required collections and indexes
 */

import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/agrotech";

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function setupForumDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("agrotech");

    // Create collections
    console.log("Creating forum collections...");

    // Forum threads collection
    const threadsCollection = db.collection("forum_threads");
    await threadsCollection.createIndex({ title: "text", content: "text" });
    await threadsCollection.createIndex({ category: 1 });
    await threadsCollection.createIndex({ tags: 1 });
    await threadsCollection.createIndex({ createdAt: -1 });
    await threadsCollection.createIndex({ lastActivity: -1 });
    await threadsCollection.createIndex({ views: -1 });
    await threadsCollection.createIndex({ likes: -1 });
    await threadsCollection.createIndex({ "author.id": 1 });
    console.log("✓ forum_threads collection created with indexes");

    // Forum replies collection
    const repliesCollection = db.collection("forum_replies");
    await repliesCollection.createIndex({ threadId: 1 });
    await repliesCollection.createIndex({ parentReplyId: 1 });
    await repliesCollection.createIndex({ createdAt: 1 });
    await repliesCollection.createIndex({ "author.id": 1 });
    console.log("✓ forum_replies collection created with indexes");

    // Forum user actions collection
    const userActionsCollection = db.collection("forum_user_actions");
    await userActionsCollection.createIndex(
      { userId: 1, threadId: 1, type: 1 },
      { unique: true }
    );
    await userActionsCollection.createIndex(
      { userId: 1, replyId: 1, type: 1 },
      { unique: true }
    );
    await userActionsCollection.createIndex({ userId: 1 });
    await userActionsCollection.createIndex({ createdAt: -1 });
    console.log("✓ forum_user_actions collection created with indexes");

    // Insert sample data
    console.log("Inserting sample data...");

    const sampleThreads = [
      {
        title:
          "Best irrigation techniques for rice cultivation in monsoon season",
        content:
          "Looking for advice on managing water levels during heavy rainfall periods. My fields tend to get waterlogged during the monsoon season, and I'm struggling to maintain proper irrigation for my rice crops.\n\nI'm currently using flood irrigation, but I'm wondering if there are better alternatives that can help me:\n\n1. Prevent waterlogging during heavy rains\n2. Maintain consistent water levels\n3. Reduce water wastage\n4. Improve crop yield\n\nMy farm is located in Punjab, and I have about 10 acres of rice fields. The soil is clay-loam, and we typically get 600-800mm of rainfall during monsoon.\n\nHas anyone faced similar challenges? What irrigation methods have worked best for you in similar conditions?",
        category: "irrigation",
        tags: ["rice", "monsoon", "water-management", "punjab"],
        author: {
          id: "sample-user-1",
          name: "Ramesh Kumar",
          avatar: null,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        views: 234,
        likes: 28,
        dislikes: 2,
        replyCount: 3,
        isSticky: true,
        isLocked: false,
      },
      {
        title: "Organic pesticide alternatives for tomato crops",
        content:
          "Has anyone tried neem oil or other organic solutions for controlling aphids and whiteflies on tomatoes? I'm looking to transition to organic farming but struggling with pest control.",
        category: "pest-control",
        tags: ["tomato", "organic", "pesticide", "aphids"],
        author: {
          id: "sample-user-2",
          name: "Priya Sharma",
          avatar: null,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
        views: 89,
        likes: 27,
        dislikes: 0,
        replyCount: 2,
        isSticky: false,
        isLocked: false,
      },
      {
        title: "Current wheat prices in Punjab market",
        content:
          "What are the current wheat prices in Punjab mandis? Should I sell now or wait for better rates? Looking for market insights from fellow farmers.",
        category: "market",
        tags: ["wheat", "prices", "punjab", "market"],
        author: {
          id: "sample-user-3",
          name: "Gurpreet Singh",
          avatar: null,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
        views: 156,
        likes: 15,
        dislikes: 0,
        replyCount: 1,
        isSticky: false,
        isLocked: false,
      },
    ];

    await threadsCollection.insertMany(sampleThreads);
    console.log("✓ Sample threads inserted");

    const sampleReplies = [
      {
        threadId: "sample-thread-1",
        content:
          "I've been using System of Rice Intensification (SRI) method for the past 3 years, and it's been a game-changer! Instead of continuous flooding, you maintain just 2-3 cm of water, which reduces waterlogging issues significantly.",
        parentReplyId: null,
        author: {
          id: "sample-user-2",
          name: "Priya Sharma",
          avatar: null,
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 12,
        dislikes: 0,
      },
      {
        threadId: "sample-thread-1",
        content:
          "Consider installing drainage systems around your fields. I had similar issues in my fields in Haryana. Installing proper drainage channels helped manage excess water during heavy rains while maintaining irrigation during dry spells.",
        parentReplyId: null,
        author: {
          id: "sample-user-3",
          name: "Gurpreet Singh",
          avatar: null,
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 8,
        dislikes: 0,
      },
    ];

    await repliesCollection.insertMany(sampleReplies);
    console.log("✓ Sample replies inserted");

    console.log("\n🎉 Forum database setup completed successfully!");
    console.log("\nYou can now:");
    console.log("- Browse forum threads at /community/forum");
    console.log("- Create new threads at /community/forum/create");
    console.log("- View individual threads at /community/forum/thread/[id]");
  } catch (error) {
    console.error("Error setting up forum database:", error);
  } finally {
    await client.close();
  }
}

// Run the setup
setupForumDatabase();
