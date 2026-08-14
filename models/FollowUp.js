const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false },
    note: { type: String, default: "" },
    followUpDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Missed"],
      default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);