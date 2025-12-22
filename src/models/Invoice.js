// src/models/Invoice.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 },
  taxPercent: { type: Number, required: true, default: 0 }, // e.g., 5 for 5%
});

// Helper virtuals will calculate totals on the fly
itemSchema.virtual("total").get(function () {
  const subtotal = this.quantity * this.price;
  const taxAmount = subtotal * (this.taxPercent / 100);
  return subtotal + taxAmount;
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    items: [itemSchema],
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "partial", "overdue"],
      default: "draft",
    },
    notes: { type: String },
    subTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Pre-save compute totals
invoiceSchema.pre("save", function () {
  try {
    let subTotal = 0;
    let taxTotal = 0;

    this.items.forEach((item) => {
      const itemSub = item.quantity * item.price;
      const itemTax = itemSub * (item.taxPercent / 100);
      subTotal += itemSub;
      taxTotal += itemTax;
    });

    this.subTotal = Number(subTotal.toFixed(2));
    this.taxTotal = Number(taxTotal.toFixed(2));
    this.total = Number((subTotal + taxTotal).toFixed(2));
  } catch (err) {
    throw new Error("Error calculating invoice totals: " + err.message);
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
