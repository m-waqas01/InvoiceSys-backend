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

// ---------- DB HEALTH CHECK ----------
app.get("/api/test_db", (req, res) => {
  const state = mongoose.connection.readyState;

  let status = "unknown";

  switch (state) {
    case 0:
      status = "disconnected";
      break;
    case 1:
      status = "connected";
      break;
    case 2:
      status = "connecting";
      break;
    case 3:
      status = "disconnecting";
      break;
    default:
      status = "unknown";
  }

  res.status(200).json({
    success: true,
    database: status,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
