const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getAdminBlogs,
} = require("../controllers/blogController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.get("/", getAllBlogs);
router.get("/:blogId", getBlogById);

// Authenticated routes
router.post("/:blogId/like", protect, toggleLike);

// Admin routes
router.get("/admin/all", protect, admin, getAdminBlogs);
router.post("/", protect, admin, createBlog);
router.put("/:blogId", protect, admin, updateBlog);
router.delete("/:blogId", protect, admin, deleteBlog);

module.exports = router;
