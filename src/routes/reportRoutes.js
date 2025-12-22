// src/routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const permit = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

router.use(auth);

router.get(
  "/dashboard",
  permit("admin", "user"),
  reportController.dashboardSummary
);

router.get(
  "/monthly-sales",
  permit("admin", "user"),
  reportController.monthlySales
);
router.get(
  "/outstanding",
  permit("admin", "user"),
  reportController.outstandingInvoices
);
router.get(
  "/sales-by-year",
  permit("admin", "user"),
  reportController.salesByYear
);

module.exports = router;
