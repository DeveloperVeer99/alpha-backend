const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { adminAuth } = require("../middleware/authMiddleware");

// Public: list all active courses
router.get("/", async (_req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch courses" });
  }
});

// Admin: create a course
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ success: false, message: "Title, description and price are required" });
    }

    const course = await Course.create({
      title,
      description,
      price: Number(price) || 0,
      label: req.body.label || "",
      accent: !!req.body.accent,
      highlights: Array.isArray(req.body.highlights) ? req.body.highlights.filter((h) => h && h.trim()) : [],
      cta: req.body.cta || "Enroll Now",
      paymentType: req.body.paymentType || "one-time payment",
      urgency: req.body.urgency || "",
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, message: "Course created", data: course });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create course" });
  }
});

// Admin: update a course (partial)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const allowed = ["title", "description", "price", "label", "accent", "highlights", "cta", "paymentType", "urgency", "isActive"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
    if (updates.highlights !== undefined) {
      updates.highlights = Array.isArray(updates.highlights) ? updates.highlights.filter((h) => h && String(h).trim()) : [];
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated", data: course });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update course" });
  }
});

// Admin: delete a course
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete course" });
  }
});

module.exports = router;
