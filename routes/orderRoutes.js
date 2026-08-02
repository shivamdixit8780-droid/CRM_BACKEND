const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

router
  .route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

router
  .route('/:id')
  .get(protect, getOrderById)
  .put(protect, updateOrder)
  .delete(protect, authorize('admin', 'manager'), deleteOrder);

module.exports = router;