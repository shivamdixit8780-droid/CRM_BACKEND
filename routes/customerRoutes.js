const express = require('express');
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

router.route('/').get(protect, getCustomers);
router
  .route("/:id")
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, authorize("admin", "manager"), deleteCustomer);

module.exports = router;