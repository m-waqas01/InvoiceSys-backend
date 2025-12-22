// src/utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const secret = process.env.JWT_SECRET || "default_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
