const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getCompanySettings,
  updateCompanySettings,
} = require('../controllers/companySettingsController');

router.get('/', protect, getCompanySettings);
router.put('/', protect, authorize('admin'), upload.single('logo'), updateCompanySettings);

module.exports = router;