const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Ensure dotenv is loaded
dotenv.config();

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Debug: Log if credentials are loaded (without exposing secrets)
console.log('Cloudinary Config:', {
  cloud_name: config.cloud_name ? '✓ Loaded' : '✗ Missing',
  api_key: config.api_key ? '✓ Loaded' : '✗ Missing',
  api_secret: config.api_secret ? '✓ Loaded' : '✗ Missing'
});

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.error('⚠️ WARNING: Cloudinary credentials are missing!');
  console.error('Please check your .env file has:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
}

cloudinary.config(config);

module.exports = cloudinary;
