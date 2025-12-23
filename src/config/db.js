// src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGO_URI not set in env");
    await mongoose.connect(uri, {
      // useNewUrlParser: true, useUnifiedTopology: true // mongoose v7 handles it
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
