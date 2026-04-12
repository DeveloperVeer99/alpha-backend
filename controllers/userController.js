const User = require("../models/User");

// Get all users (for super admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Get only normal users (exclude superadmin and analyst) - include password for super admin
    const users = await User.find({ role: "user" }).select("-__v").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const users = await User.find({ role }).select("-__v").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// Update user details (super admin only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, username, email, discordId } = req.body;

    console.log('Update user request:', { userId, name, username, email });

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Allow updating any user including superadmins
    // Update fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    if (discordId) user.discordId = discordId;

    await user.save({ validateModifiedOnly: true });

    console.log('User updated successfully:', user._id);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// Change user password (super admin only)
exports.changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    console.log('Change user password request:', { userId });

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Don't allow changing passwords of super admins
    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot change password of super admin accounts" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save({ validateModifiedOnly: true });

    console.log('User password changed successfully:', user._id);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

// Delete user (super admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete super admin accounts" 
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};
