const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get all employees (list) — sirf admin/manager access karein
const getEmployees = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update role — sirf admin kar sake
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'manager', 'sales'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apni khud ki profile dekhna
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp -otpExpiry')
      .populate('reportingManager', 'name email designation');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apni khud ki profile update karna
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      mobile,
      department,
      designation,
      dateOfJoining,
      address,
      emergencyContact,
      employeeId,
      reportingManager,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        mobile,
        department,
        designation,
        dateOfJoining,
        address,
        emergencyContact,
        employeeId,
        reportingManager,
      },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya: Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
  changePassword,
};