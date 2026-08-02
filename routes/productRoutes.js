const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router
  .route('/')
  .post(protect, authorize('admin', 'manager'), createProduct)
  .get(protect, getProducts);

router
  .route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin', 'manager'), deleteProduct);

module.exports = router;