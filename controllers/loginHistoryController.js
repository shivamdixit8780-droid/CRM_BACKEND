const LoginHistory = require('../models/LoginHistory');

// Apni khud ki login history dekhna
const getMyLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // sirf last 50 entries

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyLoginHistory };