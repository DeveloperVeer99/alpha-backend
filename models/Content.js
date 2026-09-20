const mongoose = require("mongoose");

// Generic editable content store.
// One document per website section, e.g. { key: "hero", data: { headline: ... } }
const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
