// src/controllers/paymentController.js
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("invoice")
      .sort({ paidAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("invoice");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // remove reference from invoice
    await Invoice.findByIdAndUpdate(payment.invoice, {
      $pull: { payments: payment._id },
    });

    res.json({ message: "Payment deleted" });
  } catch (err) {
    next(err);
  }
};
