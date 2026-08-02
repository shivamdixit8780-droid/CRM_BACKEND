const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/sendEmail');
const LoginHistory = require('../models/LoginHistory');   // naya import

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user (Step 1 - sends OTP)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendEmail(
      email,
      'Verify your CRM Account',
      `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`
    );

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP (Step 2 - activates account)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail(
      email,
      'Your New OTP - CRM Account',
      `Your new OTP is: ${otp}. It will expire in 10 minutes.`
    );

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user (+ login history tracking)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const user = await User.findOne({ email });

    if (!user) {
      // Failed — user hi nahi mila
      await LoginHistory.create({
        email,
        status: 'Failed',
        reason: 'User not found',
        ipAddress,
      });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      await LoginHistory.create({
        email,
        user: user._id,
        status: 'Failed',
        reason: 'Email not verified',
        ipAddress,
      });
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Failed — password galat
      await LoginHistory.create({
        email,
        user: user._id,
        status: 'Failed',
        reason: 'Wrong password',
        ipAddress,
      });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Success — login history mein save karo
    await LoginHistory.create({
      email,
      user: user._id,
      status: 'Success',
      ipAddress,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        employeeId: user.employeeId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyOTP, resendOTP, loginUser };