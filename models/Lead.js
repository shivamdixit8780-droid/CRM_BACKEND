const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    product: { type: String, default: "" },
    price: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    followUpDate: { type: Date }, // ✅ For Interested status
    source: { type: String, default: "Website" },
    status: {
      type: String,
      enum: [
        "New",
        "Pending",
        "Call Back",
        "NPC",
        "Not Interested",
        "High Price",
        "Switch Off",
        "Interested", // ✅ NEW STATUS
        "Order Done",
      ],
      default: "New",
    },
    convertedToOrder: { type: Boolean, default: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);