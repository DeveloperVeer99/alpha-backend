const express = require("express");
const router = express.Router();
const {
  getAllMessages,
  createMessage,
  deleteMessage,
  addReaction,
} = require("../controllers/messageController");
const { protect, analyst } = require("../middleware/authMiddleware");

// Public routes (authenticated users)
router.get("/", protect, getAllMessages);
router.post("/:messageId/reaction", protect, addReaction);

// Analyst & Admin routes
router.post("/", protect, analyst, createMessage);
router.delete("/:messageId", protect, analyst, deleteMessage);

module.exports = router;
