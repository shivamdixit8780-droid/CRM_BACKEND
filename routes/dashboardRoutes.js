const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardOverview } = require('../controllers/dashboardController');

router.get('/', protect, getDashboardOverview);

module.exports = router;