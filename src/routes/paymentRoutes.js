// src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const permit = require("../middleware/roleMiddleware");
const paymentController = require("../controllers/paymentController");

router.use(auth);

router.get("/", permit("admin", "user"), paymentController.getPayments);
router.get("/:id", permit("admin", "user"), paymentController.getPayment);
router.delete("/:id", permit("admin"), paymentController.deletePayment);

module.exports = router;
