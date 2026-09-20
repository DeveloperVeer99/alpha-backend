const AdminKey = require("../models/AdminKey");
const jwt = require("jsonwebtoken");

// Admin login with one-line secret key (key stored in the "adminkeys" collection)
exports.adminLogin = async (req, res) => {
  try {
    const { secretKey } = req.body;

    if (!secretKey || typeof secretKey !== "string" || !secretKey.trim()) {
      return res.status(400).json({
        success: false,
        message: "Secret key is required",
      });
    }

    const key = secretKey.trim();

    const adminKey = await AdminKey.findOne({ key, isActive: { $ne: false } });

    if (!adminKey) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      { role: "admin", keyId: adminKey._id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: { token },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Admin login failed",
    });
  }
};

// Verify the current admin session (used by the frontend route guard)
exports.verifyAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin session valid",
    data: { role: "admin" },
  });
};
