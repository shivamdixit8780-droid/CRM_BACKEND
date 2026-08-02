const Customer = require('../models/Customer');

// Get all customers (role-based filtering)
const getCustomers = async (req, res) => {
  try {
    let customers;

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      customers = await Customer.find()
        .populate('assignedTo', 'name email role')
        .populate('convertedFromLead', 'name status');
    } else {
      customers = await Customer.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email role')
        .populate('convertedFromLead', 'name status');
    }

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('convertedFromLead', 'name status');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.user.role === 'sales' && customer.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update customer (jaise notes/address update karna ho, delete nahi)
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (req.user.role === 'sales' && customer.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Sales delete nahi kar sakta
    if (req.user.role === "sales") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};