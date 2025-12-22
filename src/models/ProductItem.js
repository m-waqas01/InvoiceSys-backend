import mongoose from "mongoose";

const productItemSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0, // Tax in percentage (e.g., 10 for 10%)
    },
    total: {
      type: Number,
      required: true, // quantity * price + tax
    },
  },
  { timestamps: true }
);

const ProductItem = mongoose.model("ProductItem", productItemSchema);

export default ProductItem;
