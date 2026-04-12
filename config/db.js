const mongoose = require("mongoose");
const dns = require("dns");

// Use Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Mongo Error ❌", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
