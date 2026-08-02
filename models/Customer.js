const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  source: {
    type: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  convertedFromLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',   // kis lead se ye customer bana, uska reference rakhna
  },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);