const Client = require("../models/Client");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

// ================= DASHBOARD =================
exports.dashboardSummary = async (req, res, next) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalInvoices = await Invoice.countDocuments();

    const payments = await Payment.find();
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalClients,
      totalInvoices,
      totalPayments,
    });
  } catch (err) {
    next(err);
  }
};

// ================= MONTHLY SALES =================
exports.monthlySales = async (req, res, next) => {
  try {
    const sales = await Payment.aggregate([
      {
        $group: {
          _id: { $month: "$paidAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(sales);
  } catch (err) {
    next(err);
  }
};

// ================= OUTSTANDING INVOICES =================
exports.outstandingInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({
      status: { $in: ["unpaid", "partial"] },
    }).populate("client");

    res.json(invoices);
  } catch (err) {
    next(err);
  }
};

// ================= SALES BY YEAR =================
exports.salesByYear = async (req, res, next) => {
  try {
    const sales = await Payment.aggregate([
      {
        $group: {
          _id: { $year: "$paidAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(sales); // ✅ ARRAY
  } catch (err) {
    next(err);
  }
};
