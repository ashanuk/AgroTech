const DataLoader = require("dataloader");
const User = require("../models/User");
const Category = require("../models/Category");
const Thread = require("../models/Thread");
const Post = require("../models/Post");

// User loader
const createUserLoader = () =>
  new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } }).select(
      "-password"
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    return userIds.map((id) => userMap.get(id.toString()));
  });

// Category loader
const createCategoryLoader = () =>
  new DataLoader(async (categoryIds) => {
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(
      categories.map((category) => [category._id.toString(), category])
    );
    return categoryIds.map((id) => categoryMap.get(id.toString()));
  });

// Thread loader
const createThreadLoader = () =>
  new DataLoader(async (threadIds) => {
    const threads = await Thread.find({ _id: { $in: threadIds } });
    const threadMap = new Map(
      threads.map((thread) => [thread._id.toString(), thread])
    );
    return threadIds.map((id) => threadMap.get(id.toString()));
  });

// Post loader
const createPostLoader = () =>
  new DataLoader(async (postIds) => {
    const posts = await Post.find({ _id: { $in: postIds } });
    const postMap = new Map(posts.map((post) => [post._id.toString(), post]));
    return postIds.map((id) => postMap.get(id.toString()));
  });

// Posts by thread loader
const createPostsByThreadLoader = () =>
  new DataLoader(async (threadIds) => {
    const posts = await Post.find({
      thread_id: { $in: threadIds },
      parent_post_id: null,
    }).sort({ created_at: 1 });

    const postsByThread = new Map();
    threadIds.forEach((id) => postsByThread.set(id.toString(), []));

    posts.forEach((post) => {
      const threadId = post.thread_id.toString();
      if (!postsByThread.has(threadId)) {
        postsByThread.set(threadId, []);
      }
      postsByThread.get(threadId).push(post);
    });

    return threadIds.map((id) => postsByThread.get(id.toString()) || []);
  });

// Replies by post loader
const createRepliesByPostLoader = () =>
  new DataLoader(async (postIds) => {
    const replies = await Post.find({ parent_post_id: { $in: postIds } }).sort({
      created_at: 1,
    });

    const repliesByPost = new Map();
    postIds.forEach((id) => repliesByPost.set(id.toString(), []));

    replies.forEach((reply) => {
      const postId = reply.parent_post_id.toString();
      if (!repliesByPost.has(postId)) {
        repliesByPost.set(postId, []);
      }
      repliesByPost.get(postId).push(reply);
    });

    return postIds.map((id) => repliesByPost.get(id.toString()) || []);
  });

const createLoaders = () => ({
  userLoader: createUserLoader(),
  categoryLoader: createCategoryLoader(),
  threadLoader: createThreadLoader(),
  postLoader: createPostLoader(),
  postsByThreadLoader: createPostsByThreadLoader(),
  repliesByPostLoader: createRepliesByPostLoader(),
});

module.exports = createLoaders;
