const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1200, // Minimum 1200 ✅
    },
    category: {
      type: String,
      default: "Herbal",
    },
    description: {
      type: String,
      required: true,
    },
    usage: {
      type: String,
      required: true, // How to use ✅
    },
    benefits: {
      type: String,
    },
    image: {
      type: String, // Image name (like "HerbalFaceWash.png")
    },
    stock: {
      type: Number,
      default: 100,
    },
    size: {
      type: String, // "100 ml", "200 ml", "60 Capsules"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);