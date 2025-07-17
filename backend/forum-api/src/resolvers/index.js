const User = require("../models/User");
const Category = require("../models/Category");
const Thread = require("../models/Thread");
const Post = require("../models/Post");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper function to format farmer data
const formatFarmerData = (farmer) => {
  if (!farmer) return null;
  
  // Always return farmer data, but handle missing username gracefully
  return {
    id: farmer._id,
    username: farmer.username || farmer.name || farmer.email || `user_${farmer._id}`, // Fallback chain
    name: farmer.name || farmer.username || farmer.email || 'Unknown', // Fallback chain
    email: farmer.email,
    avatar_url: farmer.avatar_url,
    is_verified: farmer.is_verified || false
  };
};

const resolvers = {
  Query: {
    // Categories
    categories: async () => {
      const categories = await Category.find().sort({ created_at: -1 });

      // Add thread count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const thread_count = await Thread.countDocuments({
            category_id: category._id,
          });
          return {
            ...category.toObject(),
            id: category._id,
            thread_count,
          };
        })
      );

      return categoriesWithCount;
    },

    category: async (_, { id }) => {
      const category = await Category.findById(id);
      if (!category) throw new Error("Category not found");

      const thread_count = await Thread.countDocuments({ category_id: id });
      return {
        ...category.toObject(),
        id: category._id,
        thread_count,
      };
    },

    // Threads
    threads: async (_, { category_id, limit = 20, offset = 0 }) => {
      const filter = category_id ? { category_id } : {};
      const threads = await Thread.find(filter)
        .populate("category_id")
        .populate("user_id")
        .sort({ last_updated: -1 })
        .limit(limit)
        .skip(offset);

      return Promise.all(
        threads.map(async (thread) => {
          const post_count = await Post.countDocuments({
            thread_id: thread._id,
          });
          const latest_post = await Post.findOne({ thread_id: thread._id })
            .populate("user_id")
            .sort({ created_at: -1 });

          return {
            ...thread.toObject(),
            id: thread._id,
            category: {
              ...thread.category_id.toObject(),
              id: thread.category_id._id,
            },
            user: { ...thread.user_id.toObject(), id: thread.user_id._id },
            post_count,
            latest_post: latest_post
              ? {
                  ...latest_post.toObject(),
                  id: latest_post._id,
                  user: {
                    ...latest_post.user_id.toObject(),
                    id: latest_post.user_id._id,
                  },
                }
              : null,
          };
        })
      );
    },

    thread: async (_, { id }) => {
      const thread = await Thread.findById(id)
        .populate("category_id")
        .populate("user_id");

      if (!thread) throw new Error("Thread not found");

      const post_count = await Post.countDocuments({ thread_id: id });
      const latest_post = await Post.findOne({ thread_id: id })
        .populate("user_id")
        .sort({ created_at: -1 });

      return {
        ...thread.toObject(),
        id: thread._id,
        category: {
          ...thread.category_id.toObject(),
          id: thread.category_id._id,
        },
        user: { ...thread.user_id.toObject(), id: thread.user_id._id },
        post_count,
        latest_post: latest_post
          ? {
              ...latest_post.toObject(),
              id: latest_post._id,
              user: {
                ...latest_post.user_id.toObject(),
                id: latest_post.user_id._id,
              },
            }
          : null,
      };
    },

    // Posts
    posts: async (_, { thread_id, limit = 20, offset = 0 }) => {
      const posts = await Post.find({ thread_id, parent_post_id: null })
        .populate("user_id")
        .populate("likes")
        .sort({ created_at: 1 })
        .limit(limit)
        .skip(offset);

      return Promise.all(
        posts.map(async (post) => {
          const replies = await Post.find({ parent_post_id: post._id })
            .populate("user_id")
            .populate("likes")
            .sort({ created_at: 1 });

          return {
            ...post.toObject(),
            id: post._id,
            user: { ...post.user_id.toObject(), id: post.user_id._id },
            likes: post.likes.map((user) => ({
              ...user.toObject(),
              id: user._id,
            })),
            like_count: post.likes.length,
            replies: replies.map((reply) => ({
              ...reply.toObject(),
              id: reply._id,
              user: { ...reply.user_id.toObject(), id: reply.user_id._id },
              likes: reply.likes.map((user) => ({
                ...user.toObject(),
                id: user._id,
              })),
              like_count: reply.likes.length,
              reply_count: 0,
            })),
            reply_count: replies.length,
          };
        })
      );
    },

    post: async (_, { id }) => {
      const post = await Post.findById(id)
        .populate("user_id")
        .populate("likes")
        .populate("parent_post_id");

      if (!post) throw new Error("Post not found");

      const replies = await Post.find({ parent_post_id: id })
        .populate("user_id")
        .populate("likes")
        .sort({ created_at: 1 });

      return {
        ...post.toObject(),
        id: post._id,
        user: { ...post.user_id.toObject(), id: post.user_id._id },
        likes: post.likes.map((user) => ({ ...user.toObject(), id: user._id })),
        like_count: post.likes.length,
        parent_post: post.parent_post_id
          ? {
              ...post.parent_post_id.toObject(),
              id: post.parent_post_id._id,
            }
          : null,
        replies: replies.map((reply) => ({
          ...reply.toObject(),
          id: reply._id,
          user: { ...reply.user_id.toObject(), id: reply.user_id._id },
          likes: reply.likes.map((user) => ({
            ...user.toObject(),
            id: user._id,
          })),
          like_count: reply.likes.length,
          reply_count: 0,
        })),
        reply_count: replies.length,
      };
    },

    replies: async (_, { parent_post_id }) => {
      const replies = await Post.find({ parent_post_id })
        .populate("user_id")
        .populate("likes")
        .sort({ created_at: 1 });

      return replies.map((reply) => ({
        ...reply.toObject(),
        id: reply._id,
        user: { ...reply.user_id.toObject(), id: reply.user_id._id },
        likes: reply.likes.map((user) => ({
          ...user.toObject(),
          id: user._id,
        })),
        like_count: reply.likes.length,
        replies: [],
        reply_count: 0,
      }));
    },

    // Users
    users: async () => {
      const users = await User.find().select("-password");
      return users.map((user) => ({ ...user.toObject(), id: user._id }));
    },

    user: async (_, { id }) => {
      const user = await User.findById(id).select("-password");
      if (!user) throw new Error("User not found");
      return { ...user.toObject(), id: user._id };
    },

    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return { ...user.toObject(), id: user._id };
    },

    // Products
    products: async (_, { limit = 20, offset = 0, cropType, farmerId }) => {
      const filter = {};
      if (cropType) filter.cropType = cropType;
      if (farmerId) filter.farmerId = farmerId;
      
      const products = await Product.find(filter)
        .populate("farmerId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return products.map(product => {
        // Check if farmerId exists and is populated
        if (!product.farmerId) {
          console.warn(`Product ${product._id} has no associated farmer`);
          return null;
        }

        // Format farmer data - this now always returns valid data
        const farmerData = formatFarmerData(product.farmerId);

        const productObj = product.toObject();
        
        return {
          id: product._id,
          farmerId: product.farmerId._id.toString(), // Return only the ID as string
          title: productObj.title,
          description: productObj.description,
          cropType: productObj.cropType,
          pricePerKg: productObj.pricePerKg,
          totalQuantityKg: productObj.totalQuantityKg,
          availableQuantityKg: productObj.availableQuantityKg,
          unit: productObj.unit,
          images: productObj.images || [],
          location: productObj.location,
          address: productObj.address,
          createdAt: productObj.createdAt,
          updatedAt: productObj.updatedAt,
          farmer: farmerData
        };
      }).filter(Boolean); // Remove null entries
    },

    product: async (_, { id }) => {
      const product = await Product.findById(id).populate("farmerId");
      if (!product) throw new Error("Product not found");
      
      if (!product.farmerId) {
        throw new Error("Product farmer not found");
      }
      
      // Format farmer data - this now always returns valid data
      const farmerData = formatFarmerData(product.farmerId);
      
      const productObj = product.toObject();
      
      return {
        id: product._id,
        farmerId: product.farmerId._id.toString(), // Return only the ID as string
        title: productObj.title,
        description: productObj.description,
        cropType: productObj.cropType,
        pricePerKg: productObj.pricePerKg,
        totalQuantityKg: productObj.totalQuantityKg,
        availableQuantityKg: productObj.availableQuantityKg,
        unit: productObj.unit,
        images: productObj.images || [],
        location: productObj.location,
        address: productObj.address,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
        farmer: farmerData
      };
    },

    searchProducts: async (_, { query, limit = 20, offset = 0 }) => {
      try {
        // If query is too short, return empty results
        if (!query || query.trim().length < 1) {
          return [];
        }

        const searchTerm = query.trim();
        
        // Create multiple search strategies for better matching
        const searchQueries = [];
        
        // 1. Exact text search (for complete words)
        if (searchTerm.length >= 3) {
          searchQueries.push({
            $text: { $search: searchTerm }
          });
        }
        
        // 2. Regex search for partial matching (case-insensitive)
        const regexPattern = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        searchQueries.push({
          $or: [
            { title: { $regex: regexPattern } },
            { description: { $regex: regexPattern } },
            { cropType: { $regex: regexPattern } }
          ]
        });
        
        // 3. For very short queries (1-2 characters), search only title and cropType with starts-with pattern
        if (searchTerm.length <= 2) {
          const startsWithPattern = new RegExp(`^${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
          searchQueries.push({
            $or: [
              { title: { $regex: startsWithPattern } },
              { cropType: { $regex: startsWithPattern } }
            ]
          });
        }
        
        // Combine all search strategies
        const finalQuery = searchQueries.length > 1 ? { $or: searchQueries } : searchQueries[0];
        
        console.log('Search query:', JSON.stringify(finalQuery, null, 2));
        
        const products = await Product.find(finalQuery)
          .populate("farmerId")
          .sort({ 
            // Prioritize exact title matches, then text score, then creation date
            title: searchTerm.length <= 2 ? 1 : undefined,
            score: searchTerm.length >= 3 ? { $meta: "textScore" } : undefined,
            createdAt: -1 
          })
          .limit(limit)
          .skip(offset);

        console.log(`Found ${products.length} products for search: "${searchTerm}"`);

        return products.map(product => {
          // Check if farmerId exists and is populated
          if (!product.farmerId) {
            console.warn(`Product ${product._id} has no associated farmer`);
            return null;
          }

          try {
            // Format farmer data - this now always returns valid data
            const farmerData = formatFarmerData(product.farmerId);

            // Extract the product object and handle the farmerId properly
            const productObj = product.toObject();
            
            return {
              id: product._id,
              farmerId: product.farmerId._id.toString(), // Return only the ID as string
              title: productObj.title,
              description: productObj.description,
              cropType: productObj.cropType,
              pricePerKg: productObj.pricePerKg,
              totalQuantityKg: productObj.totalQuantityKg,
              availableQuantityKg: productObj.availableQuantityKg,
              unit: productObj.unit,
              images: productObj.images || [],
              location: productObj.location,
              address: productObj.address,
              createdAt: productObj.createdAt,
              updatedAt: productObj.updatedAt,
              farmer: farmerData
            };
          } catch (err) {
            console.error(`Error processing product ${product._id}:`, err);
            return null;
          }
        }).filter(Boolean); // Remove null entries
      } catch (error) {
        console.error('Error in searchProducts:', error);
        return []; // Return empty array instead of throwing
      }
    },

    nearbyProducts: async (_, { longitude, latitude, maxDistance = 10000, limit = 20 }) => {
      const products = await Product.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance // in meters
          }
        }
      })
      .populate("farmerId")
      .limit(limit);

      return products.map(product => {
        // Check if farmerId exists and is populated
        if (!product.farmerId) {
          console.warn(`Product ${product._id} has no associated farmer`);
          return null;
        }

        // Format farmer data - this now always returns valid data
        const farmerData = formatFarmerData(product.farmerId);

        const productObj = product.toObject();
        
        return {
          id: product._id,
          farmerId: product.farmerId._id.toString(), // Return only the ID as string
          title: productObj.title,
          description: productObj.description,
          cropType: productObj.cropType,
          pricePerKg: productObj.pricePerKg,
          totalQuantityKg: productObj.totalQuantityKg,
          availableQuantityKg: productObj.availableQuantityKg,
          unit: productObj.unit,
          images: productObj.images || [],
          location: productObj.location,
          address: productObj.address,
          createdAt: productObj.createdAt,
          updatedAt: productObj.updatedAt,
          farmer: farmerData
        };
      }).filter(Boolean); // Remove null entries
    },

    // Search suggestions for auto-complete
    searchProductSuggestions: async (_, { query, limit = 10 }) => {
      try {
        if (!query || query.trim().length < 1) {
          return [];
        }

        const searchTerm = query.trim();
        const regexPattern = new RegExp(`^${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        
        // Get unique product titles and crop types that start with the search term
        const [titleSuggestions, cropTypeSuggestions] = await Promise.all([
          Product.distinct('title', { title: { $regex: regexPattern } }).limit(limit / 2),
          Product.distinct('cropType', { cropType: { $regex: regexPattern } }).limit(limit / 2)
        ]);
        
        // Combine and deduplicate suggestions
        const allSuggestions = [...titleSuggestions, ...cropTypeSuggestions];
        const uniqueSuggestions = [...new Set(allSuggestions)]
          .filter(suggestion => suggestion && suggestion.toLowerCase().startsWith(searchTerm.toLowerCase()))
          .slice(0, limit);
        
        return uniqueSuggestions;
      } catch (error) {
        console.error('Error in searchProductSuggestions:', error);
        return [];
      }
    },
  },

  Mutation: {
    // Auth
    register: async (_, { input }) => {
      const { username, email, password } = input;

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      return {
        token,
        user: { ...user.toObject(), id: user._id },
      };
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Update last active
      user.last_active = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      return {
        token,
        user: { ...user.toObject(), id: user._id },
      };
    },

    // Categories
    createCategory: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const category = new Category(input);
      await category.save();

      return { ...category.toObject(), id: category._id, thread_count: 0 };
    },

    updateCategory: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const category = await Category.findByIdAndUpdate(id, input, {
        new: true,
      });
      if (!category) throw new Error("Category not found");

      const thread_count = await Thread.countDocuments({ category_id: id });
      return { ...category.toObject(), id: category._id, thread_count };
    },

    deleteCategory: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if category has threads
      const threadCount = await Thread.countDocuments({ category_id: id });
      if (threadCount > 0) {
        throw new Error("Cannot delete category with existing threads");
      }

      const deleted = await Category.findByIdAndDelete(id);
      return !!deleted;
    },

    // Threads
    createThread: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const thread = new Thread({
        ...input,
        user_id: user._id,
      });

      await thread.save();

      const populatedThread = await Thread.findById(thread._id)
        .populate("category_id")
        .populate("user_id");

      return {
        ...populatedThread.toObject(),
        id: populatedThread._id,
        category: {
          ...populatedThread.category_id.toObject(),
          id: populatedThread.category_id._id,
        },
        user: {
          ...populatedThread.user_id.toObject(),
          id: populatedThread.user_id._id,
        },
        post_count: 0,
        latest_post: null,
      };
    },

    updateThread: async (_, { id, title }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const thread = await Thread.findById(id);
      if (!thread) throw new Error("Thread not found");

      if (thread.user_id.toString() !== user._id.toString()) {
        throw new Error("Not authorized to update this thread");
      }

      thread.title = title;
      await thread.save();

      const populatedThread = await Thread.findById(id)
        .populate("category_id")
        .populate("user_id");

      const post_count = await Post.countDocuments({ thread_id: id });

      return {
        ...populatedThread.toObject(),
        id: populatedThread._id,
        category: {
          ...populatedThread.category_id.toObject(),
          id: populatedThread.category_id._id,
        },
        user: {
          ...populatedThread.user_id.toObject(),
          id: populatedThread.user_id._id,
        },
        post_count,
      };
    },

    deleteThread: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const thread = await Thread.findById(id);
      if (!thread) throw new Error("Thread not found");

      if (thread.user_id.toString() !== user._id.toString()) {
        throw new Error("Not authorized to delete this thread");
      }

      // Delete all posts in the thread
      await Post.deleteMany({ thread_id: id });

      // Delete the thread
      await Thread.findByIdAndDelete(id);

      return true;
    },

    lockThread: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const thread = await Thread.findByIdAndUpdate(
        id,
        { is_locked: true },
        { new: true }
      )
        .populate("category_id")
        .populate("user_id");

      if (!thread) throw new Error("Thread not found");

      const post_count = await Post.countDocuments({ thread_id: id });

      return {
        ...thread.toObject(),
        id: thread._id,
        category: {
          ...thread.category_id.toObject(),
          id: thread.category_id._id,
        },
        user: { ...thread.user_id.toObject(), id: thread.user_id._id },
        post_count,
      };
    },

    unlockThread: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const thread = await Thread.findByIdAndUpdate(
        id,
        { is_locked: false },
        { new: true }
      )
        .populate("category_id")
        .populate("user_id");

      if (!thread) throw new Error("Thread not found");

      const post_count = await Post.countDocuments({ thread_id: id });

      return {
        ...thread.toObject(),
        id: thread._id,
        category: {
          ...thread.category_id.toObject(),
          id: thread.category_id._id,
        },
        user: { ...thread.user_id.toObject(), id: thread.user_id._id },
        post_count,
      };
    },

    // Posts
    createPost: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if thread is locked
      const thread = await Thread.findById(input.thread_id);
      if (!thread) throw new Error("Thread not found");
      if (thread.is_locked) throw new Error("Thread is locked");

      const post = new Post({
        ...input,
        user_id: user._id,
      });

      await post.save();

      const populatedPost = await Post.findById(post._id)
        .populate("user_id")
        .populate("likes");

      return {
        ...populatedPost.toObject(),
        id: populatedPost._id,
        user: {
          ...populatedPost.user_id.toObject(),
          id: populatedPost.user_id._id,
        },
        likes: populatedPost.likes.map((user) => ({
          ...user.toObject(),
          id: user._id,
        })),
        like_count: populatedPost.likes.length,
        replies: [],
        reply_count: 0,
      };
    },

    updatePost: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");

      if (post.user_id.toString() !== user._id.toString()) {
        throw new Error("Not authorized to update this post");
      }

      post.content = input.content;
      post.image_urls = input.image_urls || post.image_urls;
      post.is_edited = true;

      await post.save();

      const populatedPost = await Post.findById(id)
        .populate("user_id")
        .populate("likes");

      const replies = await Post.find({ parent_post_id: id })
        .populate("user_id")
        .populate("likes");

      return {
        ...populatedPost.toObject(),
        id: populatedPost._id,
        user: {
          ...populatedPost.user_id.toObject(),
          id: populatedPost.user_id._id,
        },
        likes: populatedPost.likes.map((user) => ({
          ...user.toObject(),
          id: user._id,
        })),
        like_count: populatedPost.likes.length,
        replies: replies.map((reply) => ({
          ...reply.toObject(),
          id: reply._id,
          user: { ...reply.user_id.toObject(), id: reply.user_id._id },
          likes: reply.likes.map((user) => ({
            ...user.toObject(),
            id: user._id,
          })),
          like_count: reply.likes.length,
          reply_count: 0,
        })),
        reply_count: replies.length,
      };
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");

      if (post.user_id.toString() !== user._id.toString()) {
        throw new Error("Not authorized to delete this post");
      }

      // Delete all replies to this post
      await Post.deleteMany({ parent_post_id: id });

      // Delete the post
      await Post.findByIdAndDelete(id);

      return true;
    },

    likePost: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");

      // Check if user already liked the post
      if (post.likes.includes(user._id)) {
        throw new Error("Post already liked");
      }

      post.likes.push(user._id);
      await post.save();

      const populatedPost = await Post.findById(id)
        .populate("user_id")
        .populate("likes");

      const replies = await Post.find({ parent_post_id: id })
        .populate("user_id")
        .populate("likes");

      return {
        ...populatedPost.toObject(),
        id: populatedPost._id,
        user: {
          ...populatedPost.user_id.toObject(),
          id: populatedPost.user_id._id,
        },
        likes: populatedPost.likes.map((user) => ({
          ...user.toObject(),
          id: user._id,
        })),
        like_count: populatedPost.likes.length,
        replies: replies.map((reply) => ({
          ...reply.toObject(),
          id: reply._id,
          user: { ...reply.user_id.toObject(), id: reply.user_id._id },
          likes: reply.likes.map((user) => ({
            ...user.toObject(),
            id: user._id,
          })),
          like_count: reply.likes.length,
          reply_count: 0,
        })),
        reply_count: replies.length,
      };
    },

    unlikePost: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found");

      // Check if user liked the post
      if (!post.likes.includes(user._id)) {
        throw new Error("Post not liked");
      }

      post.likes = post.likes.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await post.save();

      const populatedPost = await Post.findById(id)
        .populate("user_id")
        .populate("likes");

      const replies = await Post.find({ parent_post_id: id })
        .populate("user_id")
        .populate("likes");

      return {
        ...populatedPost.toObject(),
        id: populatedPost._id,
        user: {
          ...populatedPost.user_id.toObject(),
          id: populatedPost.user_id._id,
        },
        likes: populatedPost.likes.map((user) => ({
          ...user.toObject(),
          id: user._id,
        })),
        like_count: populatedPost.likes.length,
        replies: replies.map((reply) => ({
          ...reply.toObject(),
          id: reply._id,
          user: { ...reply.user_id.toObject(), id: reply.user_id._id },
          likes: reply.likes.map((user) => ({
            ...user.toObject(),
            id: user._id,
          })),
          like_count: reply.likes.length,
          reply_count: 0,
        })),
        reply_count: replies.length,
      };
    },

    // Products
    createProduct: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const product = new Product({
        ...input,
        farmerId: input.farmerId || user._id
      });

      const savedProduct = await product.save();
      const populatedProduct = await Product.findById(savedProduct._id)
        .populate("farmerId");

      if (!populatedProduct.farmerId) {
        throw new Error("Failed to populate farmer data");
      }

      return {
        ...populatedProduct.toObject(),
        id: populatedProduct._id,
        farmer: {
          ...populatedProduct.farmerId.toObject(),
          id: populatedProduct.farmerId._id
        }
      };
    },

    updateProduct: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const product = await Product.findById(id);
      if (!product) throw new Error("Product not found");

      // Check if user owns the product or is admin
      if (product.farmerId.toString() !== user._id.toString()) {
        throw new Error("Not authorized to update this product");
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true }
      ).populate("farmerId");

      if (!updatedProduct.farmerId) {
        throw new Error("Failed to populate farmer data");
      }

      return {
        ...updatedProduct.toObject(),
        id: updatedProduct._id,
        farmer: {
          ...updatedProduct.farmerId.toObject(),
          id: updatedProduct.farmerId._id
        }
      };
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const product = await Product.findById(id);
      if (!product) throw new Error("Product not found");

      // Check if user owns the product or is admin
      if (product.farmerId.toString() !== user._id.toString()) {
        throw new Error("Not authorized to delete this product");
      }

      await Product.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = resolvers;
