const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true,
  },
  reason: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);