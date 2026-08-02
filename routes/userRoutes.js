const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');
const {
  getEmployees,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require('../controllers/userController');

router.get('/', protect, authorize('admin', 'manager'), getEmployees);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.put('/change-password', protect, changePassword);

// Profile photo upload
router.put('/me/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
      await user.save();
    }

    res.status(200).json({ profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;