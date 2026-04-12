const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const messages = await Message.find({ isDeleted: false })
      .populate("sender", "name username role")
      .populate("relatedSignal", "symbol type")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages",
    });
  }
};

// Create message (Analyst & Admin only)
exports.createMessage = async (req, res) => {
  try {
    const { text, relatedSignal, image } = req.body;

    let imageUrl = null;

    // If image is provided as base64, upload to Cloudinary
    if (image) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'tradersregion/messages',
          resource_type: 'auto'
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    }

    // Determine message type
    let type = "TEXT";
    if (text && imageUrl) {
      type = "TEXT_IMAGE";
    } else if (imageUrl) {
      type = "IMAGE";
    }

    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or image",
      });
    }

    const message = await Message.create({
      text,
      image: imageUrl,
      type,
      sender: req.user._id,
      relatedSignal: relatedSignal || null,
    });

    await message.populate("sender", "name username role");
    if (relatedSignal) {
      await message.populate("relatedSignal", "symbol type");
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

// Delete message (Admin only or message sender)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender or super admin
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      // Update reaction
      existingReaction.emoji = emoji;
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      data: message.reactions,
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add reaction",
    });
  }
};
