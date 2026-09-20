const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const { adminAuth } = require("../middleware/authMiddleware");

const SECTION_KEYS = [
  "hero",
  "mentor",
  "curriculum",
  "community",
  "enroll",
  "faq",
  "footer",
];

// Public: read a single section's content
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;

    if (!SECTION_KEYS.includes(key)) {
      return res.status(404).json({ success: false, message: "Unknown section" });
    }

    const doc = await Content.findOne({ key });

    res.status(200).json({
      success: true,
      data: doc ? doc.data : null,
    });
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch content" });
  }
});

// Public: read all sections at once (used by the homepage)
router.get("/", async (_req, res) => {
  try {
    const docs = await Content.find({});
    const data = {};
    docs.forEach((doc) => {
      data[doc.key] = doc.data;
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get all content error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch content" });
  }
});

// Admin: upsert a section's content
router.put("/:key", adminAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    if (!SECTION_KEYS.includes(key)) {
      return res.status(400).json({ success: false, message: "Unknown section" });
    }

    if (typeof data !== "object" || data === null) {
      return res.status(400).json({ success: false, message: "Invalid content data" });
    }

    const doc = await Content.findOneAndUpdate(
      { key },
      { key, data, updatedAt: new Date() },
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Content saved successfully",
      data: doc.data,
    });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to save content" });
  }
});

module.exports = router;
