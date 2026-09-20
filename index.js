const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

// middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// DB connection for serverless
let isConnected = false;

const ensureDbConnection = async () => {
  if (isConnected) {
    return;
  }
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('DB Connection Error:', error);
  }
};

// Middleware to ensure DB connection before each request
app.use(async (req, res, next) => {
  await ensureDbConnection();
  next();
});

// routes
app.get("/", (req, res) => {
  res.json({
    message: "Alpha Circle API running 🚀",
    version: "3.0.0",
    status: "active"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Alpha Circle API v3.0",
    endpoints: {
      auth: "/api/auth"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Export for Vercel serverless
module.exports = app;
