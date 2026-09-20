const express = require("express");
const router = express.Router();
const { adminLogin, verifyAdmin } = require("../controllers/authController");
const { adminAuth } = require("../middleware/authMiddleware");

// Admin login with one-line secret key
router.post("/admin-login", adminLogin);

// Verify current admin session
router.get("/verify", adminAuth, verifyAdmin);

module.exports = router;
