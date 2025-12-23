// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const mongoose = require("mongoose");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://invoice-sys-frontend.vercel.app/", // frontend URL
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => res.json({ message: "Invoice Management API" }));

// Test DB connection route
app.get("/api/test-db", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    dbState: states[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
