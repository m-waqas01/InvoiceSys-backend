// // src/config/db.js
// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const uri = process.env.MONGO_URI;
//     if (!uri) throw new Error("MONGO_URI not set in env");
//     await mongoose.connect(uri, {
//       // useNewUrlParser: true, useUnifiedTopology: true // mongoose v7 handles it
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

// src/config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error("MongoDB URI not set in env");

    const conn = await mongoose.connect(uri);
    isConnected = conn.connection.readyState === 1;

    console.log("🟢 MongoDB connected");
  } catch (err) {
    console.error("🔴 MongoDB connection error:", err.message);
    // ❌ DO NOT exit process on Vercel
  }
};

module.exports = connectDB;
