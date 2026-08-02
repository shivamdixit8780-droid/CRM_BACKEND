const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');

router
  .route('/')
  .post(protect, createLead)
  .get(protect, getLeads);

router
  .route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, authorize('admin', 'manager'), deleteLead);

module.exports = router;