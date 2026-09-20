const mongoose = require("mongoose");

const adminKeySchema = new mongoose.Schema(
  {
    // The one-line secret key used to log in to the admin panel.
    // Keys are added directly to the database (collection: "adminkeys").
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Optional label to identify the key (e.g. "main", "backup")
    label: {
      type: String,
      trim: true,
    },
    // Set to false in the database to revoke a key without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminKey", adminKeySchema);
