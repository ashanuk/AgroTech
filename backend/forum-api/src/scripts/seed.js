const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Category = require("../models/Category");
const Thread = require("../models/Thread");
const Post = require("../models/Post");

const connectDB = require("../config/database");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Thread.deleteMany({});
    await Post.deleteMany({});

    console.log("Cleared existing data");

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = await User.insertMany([
      {
        username: "farmerjohn",
        email: "john@example.com",
        password: hashedPassword,
        bio: "Experienced farmer with 20+ years in agriculture",
      },
      {
        username: "agriexpert",
        email: "expert@example.com",
        password: hashedPassword,
        bio: "Agricultural consultant and researcher",
      },
      {
        username: "croptech",
        email: "tech@example.com",
        password: hashedPassword,
        bio: "Technology enthusiast in agriculture",
      },
    ]);

    console.log("Created sample users");

    // Create categories
    const categories = await Category.insertMany([
      {
        name: "Crop Management",
        description:
          "Discussion about crop planning, cultivation, and management techniques",
      },
      {
        name: "Market Prices",
        description: "Current market prices and trading discussions",
      },
      {
        name: "Weather & Climate",
        description: "Weather predictions and climate-related farming topics",
      },
      {
        name: "Technology",
        description: "Agricultural technology, tools, and innovations",
      },
      {
        name: "General Discussion",
        description: "General farming and agriculture discussions",
      },
    ]);

    console.log("Created categories");

    // Create sample threads
    const threads = await Thread.insertMany([
      {
        category_id: categories[0]._id,
        user_id: users[0]._id,
        title: "Best practices for rice cultivation this season",
      },
      {
        category_id: categories[1]._id,
        user_id: users[1]._id,
        title: "Rice price predictions for next month",
      },
      {
        category_id: categories[2]._id,
        user_id: users[2]._id,
        title: "Impact of upcoming monsoon on crop yields",
      },
      {
        category_id: categories[3]._id,
        user_id: users[0]._id,
        title: "IoT sensors for soil monitoring - worth the investment?",
      },
      {
        category_id: categories[4]._id,
        user_id: users[1]._id,
        title: "Welcome to AgroTech Forum - Introduce yourself!",
      },
    ]);

    console.log("Created sample threads");

    // Create sample posts
    const posts = await Post.insertMany([
      {
        thread_id: threads[0]._id,
        user_id: users[0]._id,
        content:
          "I've been growing rice for over 15 years and wanted to share some insights about this season. The weather patterns suggest we should adjust our planting schedule.",
        image_urls: [],
      },
      {
        thread_id: threads[0]._id,
        user_id: users[1]._id,
        content:
          "Great point! I've noticed similar patterns in my region. What specific adjustments are you making to your fertilizer application?",
        image_urls: [],
      },
      {
        thread_id: threads[1]._id,
        user_id: users[1]._id,
        content:
          "Based on current market trends and upcoming harvest schedules, I expect rice prices to increase by 15-20% next month. Here's my analysis...",
        image_urls: [],
      },
      {
        thread_id: threads[2]._id,
        user_id: users[2]._id,
        content:
          "The meteorological department has predicted above-normal rainfall this monsoon. This could significantly impact our crop planning. What are your thoughts?",
        image_urls: [],
      },
      {
        thread_id: threads[3]._id,
        user_id: users[0]._id,
        content:
          "I recently invested in IoT soil sensors for my farm. Initial results are promising, but the cost is significant. Has anyone else tried this technology?",
        image_urls: [],
      },
    ]);

    console.log("Created sample posts");

    // Create some replies
    await Post.insertMany([
      {
        thread_id: threads[0]._id,
        user_id: users[2]._id,
        content:
          "Thanks for sharing your experience! I'm also considering adjusting my planting dates. Have you experimented with different rice varieties?",
        parent_post_id: posts[0]._id,
        image_urls: [],
      },
      {
        thread_id: threads[3]._id,
        user_id: users[1]._id,
        content:
          "I've been considering IoT sensors too. Could you share more details about the specific benefits you've observed?",
        parent_post_id: posts[4]._id,
        image_urls: [],
      },
    ]);

    console.log("Created sample replies");

    console.log("Database seeded successfully!");
    console.log("\nSample users created:");
    console.log("Email: john@example.com, Password: password123");
    console.log("Email: expert@example.com, Password: password123");
    console.log("Email: tech@example.com, Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
