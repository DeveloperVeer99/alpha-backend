const mongoose = require("mongoose");
const dns = require("dns");

// Set DNS servers to Google's public DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

const connectDB = async () => {
  try {
    // If already connected, return
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return;
    }

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Connect with retry logic
    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    };

    console.log("Attempting to connect to MongoDB...");
    
    await mongoose.connect(mongoUri, options);
    
    isConnected = true;
    connectionAttempts = 0;
    console.log("✅ MongoDB Connected Successfully");

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    isConnected = false;
    connectionAttempts++;

    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`Retrying connection... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(); // Retry
    }
    
    // Don't crash in production, allow app to continue
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to MongoDB after multiple attempts. App will continue without DB.');
      return;
    }
    
    throw error;
  }
};

module.exports = connectDB;
