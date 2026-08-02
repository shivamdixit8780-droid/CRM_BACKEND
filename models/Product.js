const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({image: {
  type: String,
  default: ""
},
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
  },
  description: {
    type: String,
  },
  stock: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);