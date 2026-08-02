const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
} = require('../controllers/followUpController');

router
  .route('/')
  .post(protect, createFollowUp)
  .get(protect, getFollowUps);

router
  .route('/:id')
  .get(protect, getFollowUpById)
  .put(protect, updateFollowUp)
  .delete(protect, authorize('admin', 'manager'), deleteFollowUp);

module.exports = router;