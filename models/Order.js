const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    product: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirm",
        "Processing",
        "In Transit",
        "Out for Delivery",
        "Pickup",
        "Shipped",
        "Delivered",
        "RTO",
        "Cancelled",
      ],
      default: "Pending",
    },
    notes: { type: String, default: "" },
    
    // ✅ Original MongoDB ObjectId reference (backend use ke liye)
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: false },
    
    // ✅ NEW: Human-readable Lead Code (LD-0021) — frontend mein display ke liye
    leadCode: { type: String, default: "" },
    
    convertedToCustomer: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);