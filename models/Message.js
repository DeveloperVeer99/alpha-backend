const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Message content
    text: { type: String, trim: true },
    image: { type: String }, // Image URL/path
    
    // Sender info
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Message type
    type: { 
      type: String, 
      enum: ["TEXT", "IMAGE", "TEXT_IMAGE"], 
      required: true 
    },
    
    // Related signal (optional)
    relatedSignal: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Signal" 
    },
    
    // Engagement
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: { type: String }
    }],
    
    // Status
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model("Message", messageSchema);
