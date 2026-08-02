const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  // ya to Lead se linked hoga, ya Customer se — dono me se ek hi bharega
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  note: {
    type: String,
    required: true,   // kis baare me follow-up karna hai
  },
  followUpDate: {
    type: Date,
    required: true,   // kab follow-up karna hai
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Missed'],
    default: 'Pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);