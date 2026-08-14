const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    product: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
    leadCode: { type: String, default: "" },
    source: { type: String, default: "Order" },

    // ✅ NEW: User tracking - kaunsa user ne banaya
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;