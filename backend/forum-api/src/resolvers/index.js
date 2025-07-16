const User = require("../models/User");
const Category = require("../models/Category");
const Thread = require("../models/Thread");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
  },
};

module.exports = resolvers;
