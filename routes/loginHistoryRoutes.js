const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyLoginHistory } = require('../controllers/loginHistoryController');

router.get('/', protect, getMyLoginHistory);

module.exports = router;