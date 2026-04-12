const express = require("express");
const router = express.Router();
const { register, login, getProfile, resetPassword, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/reset-password", protect, resetPassword);
router.put("/change-password", changePassword);

module.exports = router;
