const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const signalRoutes = require("./routes/signalRoutes");
const messageRoutes = require("./routes/messageRoutes");
const blogRoutes = require("./routes/blogRoutes");

dotenv.config();

// DB connect
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tradersregion.in",
  "https://www.tradersregion.in",
  process.env.FRONTEND_URL
].filter(Boolean);

// middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// routes
app.get("/", (req, res) => {
  res.json({ 
    message: "TradersRegion API running 🚀",
    version: "2.0.0",
    status: "active"
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "TradersRegion API v2.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      signals: "/api/signals",
      messages: "/api/messages",
      blogs: "/api/blogs"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/signals", signalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/blogs", blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
