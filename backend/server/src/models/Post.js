const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  image_urls: [
    {
      type: String,
      trim: true,
    },
  ],
  parent_post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_edited: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Indexes for better query performance
postSchema.index({ thread_id: 1 });
postSchema.index({ user_id: 1 });
postSchema.index({ parent_post_id: 1 });
postSchema.index({ thread_id: 1, created_at: 1 });

// Update thread's last_updated when a post is created/updated
postSchema.post("save", async function () {
  const Thread = mongoose.model("Thread");
  await Thread.findByIdAndUpdate(this.thread_id, { last_updated: new Date() });
});

module.exports = mongoose.model("Post", postSchema);
