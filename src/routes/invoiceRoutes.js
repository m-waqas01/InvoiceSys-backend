// src/routes/invoiceRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const permit = require("../middleware/roleMiddleware");
const invoiceController = require("../controllers/invoiceController");

router.use(auth);

router.post("/", permit("admin", "user"), invoiceController.createInvoice);
router.get("/", permit("admin", "user"), invoiceController.getInvoices);
router.get("/:id", permit("admin", "user"), invoiceController.getInvoice);
router.put("/:id", permit("admin", "user"), invoiceController.updateInvoice);
router.delete("/:id", permit("admin"), invoiceController.deleteInvoice);

router.get(
  "/:id/export/pdf",
  permit("admin", "user"),
  invoiceController.exportInvoicePDF
);
router.post(
  "/:id/send",
  permit("admin", "user"),
  invoiceController.sendInvoiceByEmail
);
router.post(
  "/:id/payments",
  permit("admin", "user"),
  invoiceController.markInvoiceAsPaid
);

module.exports = router;
