const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
    enum: ['Website', 'Referral', 'Ads', 'Walk-in', 'Other', 'Cold Call', 'LinkedIn', 'Instagram', 'Google Ads', 'Facebook'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'],
    default: 'New',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);