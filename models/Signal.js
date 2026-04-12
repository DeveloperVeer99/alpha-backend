const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    
    // Trading Details
    symbol: { type: String, required: true, trim: true, uppercase: true }, // e.g., BTC/USDT
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    entryPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    takeProfit: [{ type: Number }], // Multiple TP levels
    
    // Signal Status
    status: { 
      type: String, 
      enum: ["ACTIVE", "CLOSED", "CANCELLED"], 
      default: "ACTIVE" 
    },
    
    // Results (when closed)
    closePrice: { type: Number },
    profitLoss: { type: Number }, // Percentage
    outcome: { type: String, enum: ["WIN", "LOSS", "BREAKEVEN"] },
    
    // Metadata
    postedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    timeframe: { type: String, trim: true }, // e.g., 1H, 4H, 1D
    leverage: { type: String, trim: true }, // e.g., 5x, 10x
    riskLevel: { 
      type: String, 
      enum: ["LOW", "MEDIUM", "HIGH"], 
      default: "MEDIUM" 
    },
    
    // Engagement
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Index for faster queries
signalSchema.index({ status: 1, createdAt: -1 });
signalSchema.index({ postedBy: 1 });
signalSchema.index({ symbol: 1 });

module.exports = mongoose.model("Signal", signalSchema);
