const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'sales', 'manager'],
    default: 'sales',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  designation: {
    type: String,
    enum: ['Sales Executive', 'Sales Manager'],
  },
  department: {
    type: String,
  },
  mobile: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  address: {
    type: String,
  },
  emergencyContact: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);