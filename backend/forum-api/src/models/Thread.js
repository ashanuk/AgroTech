const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_locked: {
    type: Boolean,
    default: false,
  },
  last_updated: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
threadSchema.index({ category_id: 1 });
threadSchema.index({ user_id: 1 });
threadSchema.index({ last_updated: -1 });
threadSchema.index({ category_id: 1, last_updated: -1 });

// Update last_updated when thread is modified
threadSchema.pre("save", function (next) {
  this.last_updated = new Date();
  next();
});

module.exports = mongoose.model("Thread", threadSchema);
