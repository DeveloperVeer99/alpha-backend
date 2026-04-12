const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true }, // Short description
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    category: { 
      type: String, 
      enum: ["Trading", "Market Analysis", "Education", "News", "Strategy", "Other"], 
      default: "Other" 
    },
    tags: [{ type: String, trim: true }],
    status: { 
      type: String, 
      enum: ["DRAFT", "PUBLISHED"], 
      default: "PUBLISHED" 
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Index for faster queries
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model("Blog", blogSchema);
