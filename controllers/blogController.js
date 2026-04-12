const Blog = require("../models/Blog");

// Get all published blogs (public)
exports.getAllBlogs = async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    const filter = { status: "PUBLISHED" };
    if (category) filter.category = category;

    const blogs = await Blog.find(filter)
      .populate("author", "name username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

// Get single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate("author", "name username role");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Increment views (no auth required)
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

// Create blog (Super Admin only)
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status } = req.body;

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      status: status || "PUBLISHED",
      author: req.user._id,
    });

    await blog.populate("author", "name username");

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog",
    });
  }
};

// Update blog (Super Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const updates = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Update tags if provided
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(",").map(tag => tag.trim());
    }

    Object.keys(updates).forEach((key) => {
      blog[key] = updates[key];
    });

    await blog.save();
    await blog.populate("author", "name username");

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
};

// Delete blog (Super Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

// Toggle like on blog
exports.toggleLike = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const userIndex = blog.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      blog.likes.splice(userIndex, 1);
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? "Blog unliked" : "Blog liked",
      data: { likes: blog.likes.length },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    });
  }
};

// Get all blogs for admin (including drafts)
exports.getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Get admin blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};
