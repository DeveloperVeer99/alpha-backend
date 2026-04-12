const express = require("express");
const router = express.Router();
const { getAllUsers, getUsersByRole, updateUser, changeUserPassword, deleteUser } = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/all", protect, admin, getAllUsers);
router.get("/role/:role", protect, admin, getUsersByRole);
router.put("/update/:userId", protect, admin, updateUser);
router.put("/change-password/:userId", protect, admin, changeUserPassword);
router.delete("/delete/:userId", protect, admin, deleteUser);

module.exports = router;
