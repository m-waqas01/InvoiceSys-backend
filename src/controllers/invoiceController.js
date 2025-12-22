const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Payment = require("../models/Payment");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const sendInvoiceMail = require("../utils/sendInvoiceMail");

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = async () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${timestamp}-${random}`;
};

// ================= CREATE INVOICE =================
exports.createInvoice = async (req, res, next) => {
  try {
    const {
      client: clientId,
      items = [],
      dueDate,
      notes,
      issueDate,
    } = req.body;

    if (!clientId)
      return res.status(400).json({ message: "Client is required" });

    if (!items.length)
      return res.status(400).json({ message: "At least one item is required" });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const invoiceNumber = await generateInvoiceNumber();

    let subTotal = 0;
    let taxTotal = 0;

    const invoiceItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const tax = Number(item.tax || 0);

      const itemSub = quantity * price;
      const itemTax = itemSub * (tax / 100);

      subTotal += itemSub;
      taxTotal += itemTax;

      return {
        description: item.name,
        quantity,
        price,
        taxPercent: tax,
      };
    });

    const invoice = new Invoice({
      invoiceNumber,
      client: clientId,
      items: invoiceItems,
      issueDate: issueDate || Date.now(),
      dueDate,
      notes,
      createdBy: req.user._id,
      subTotal,
      taxTotal,
      total: subTotal + taxTotal,
      status: "draft",
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
};

// ================= GET ALL INVOICES =================
exports.getInvoices = async (req, res, next) => {
  try {
    const { status, client, from, to } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (from || to) {
      filter.issueDate = {};
      if (from) filter.issueDate.$gte = new Date(from);
      if (to) filter.issueDate.$lte = new Date(to);
    }

    const invoices = await Invoice.find(filter)
      .populate("client")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    next(err);
  }
};

// ================= GET SINGLE INVOICE =================
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client")
      .populate("payments");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Calculate remaining balance
    const paidAmount = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const remainingBalance = invoice.total - paidAmount;

    res.json({
      ...invoice.toObject(),
      paidAmount,
      remainingBalance,
    });
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE INVOICE =================
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const { items, dueDate, notes, status } = req.body;

    if (dueDate) invoice.dueDate = dueDate;
    if (notes) invoice.notes = notes;
    if (status) invoice.status = status;

    if (items) {
      let subTotal = 0;
      let taxTotal = 0;

      const updatedItems = items.map((item) => {
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        const tax = Number(item.tax || 0);

        const itemSub = quantity * price;
        const itemTax = itemSub * (tax / 100);

        subTotal += itemSub;
        taxTotal += itemTax;

        return {
          description: item.name,
          quantity,
          price,
          taxPercent: tax,
        };
      });

      invoice.items = updatedItems;
      invoice.subTotal = subTotal;
      invoice.taxTotal = taxTotal;
      invoice.total = subTotal + taxTotal;
    }

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

// ================= DELETE INVOICE =================
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ================= EXPORT PDF =================
exports.exportInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("client");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const buffer = await generateInvoicePDF(invoice, invoice.client, {
      name: process.env.COMPANY_NAME || "My Company",
      address: process.env.COMPANY_ADDRESS || "",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`,
    });

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// ================= SEND EMAIL =================
exports.sendInvoiceByEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("client");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const buffer = await generateInvoicePDF(invoice, invoice.client, {
      name: process.env.COMPANY_NAME || "My Company",
      address: process.env.COMPANY_ADDRESS || "",
    });

    await sendInvoiceMail({
      to: invoice.client.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: `Please find attached invoice ${invoice.invoiceNumber}`,
      attachments: [
        { filename: `${invoice.invoiceNumber}.pdf`, content: buffer },
      ],
    });

    if (invoice.status === "draft") invoice.status = "sent";
    await invoice.save();

    res.json({ message: "Invoice sent successfully" });
  } catch (err) {
    next(err);
  }
};

// ================= ADD PAYMENT (FIXED) =================
exports.markInvoiceAsPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("payments");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const amount = Number(req.body.amount);
    const { method, paidAt, note } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid payment amount" });

    // Calculate already paid
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const remainingBalance = invoice.total - totalPaid;

    // 🔒 Restrict overpayment
    if (amount > remainingBalance) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance (${remainingBalance})`,
      });
    }

    const payment = await Payment.create({
      invoice: invoice._id,
      amount,
      method,
      paidAt: paidAt || Date.now(),
      note,
    });

    invoice.payments.push(payment._id);

    const newPaidTotal = totalPaid + amount;

    if (newPaidTotal === invoice.total) invoice.status = "paid";
    else invoice.status = "partial";

    await invoice.save();

    res.json({
      payment,
      totalPaid: newPaidTotal,
      remainingBalance: invoice.total - newPaidTotal,
      status: invoice.status,
    });
  } catch (err) {
    next(err);
  }
};
