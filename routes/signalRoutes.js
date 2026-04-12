const express = require("express");
const router = express.Router();
const {
  createSignal,
  getAllSignals,
  getSignalById,
  updateSignal,
  closeSignal,
  deleteSignal,
  toggleLike,
  getAnalytics,
  getMySignals,
} = require("../controllers/signalController");
const { protect, analyst, admin } = require("../middleware/authMiddleware");

// Public routes (authenticated users)
router.get("/", protect, getAllSignals);
router.get("/analytics", protect, getAnalytics);
router.get("/:signalId", protect, getSignalById);
router.post("/:signalId/like", protect, toggleLike);

// Analyst & Admin routes
router.post("/", protect, analyst, createSignal);
router.get("/my/signals", protect, analyst, getMySignals);
router.put("/:signalId", protect, analyst, updateSignal);
router.put("/:signalId/close", protect, analyst, closeSignal);

// Admin only routes
router.delete("/:signalId", protect, admin, deleteSignal);

module.exports = router;
