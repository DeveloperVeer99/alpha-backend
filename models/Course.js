const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Small label on the card, e.g. "Popular", "Best Value"
  label: {
    type: String,
    trim: true,
    default: "",
  },
  // Featured card gets the gold treatment
  accent: {
    type: Boolean,
    default: false,
  },
  // Bullet points shown with a check icon on the card
  highlights: {
    type: [String],
    default: [],
  },
  cta: {
    type: String,
    trim: true,
    default: "Enroll Now",
  },
  paymentType: {
    type: String,
    trim: true,
    default: "one-time payment",
  },
  // Show a countdown/urgency line, e.g. "Only 8 seats left this month"
  urgency: {
    type: String,
    trim: true,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose 9 hooks are promise-style — no `next` callback
 courseSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Course", courseSchema);
