const Customer = require("../models/Customer");

// ✅ Get customers - Role based filter
const getCustomers = async (req, res) => {
  console.log("========== GET CUSTOMERS ==========");
  console.log("User:", req.user?.email);
  console.log("Role:", req.user?.role);
  
  try {
    let filter = {};

    if (req.user.role === "sales") {
      filter = { createdBy: req.user._id };
    }

    console.log("Filter:", filter);

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    console.log("Customers found:", customers.length);
    console.log("===================================");
    
    res.status(200).json(customers);
  } catch (error) {
    console.error("Get customers error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single customer - permission check
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Sales user sirf apne customer dekh sake
    if (
      req.user.role === "sales" &&
      customer.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Get customer error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update customer - permission check
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Sales user sirf apne customer update kare
    if (
      req.user.role === "sales" &&
      customer.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Update customer error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Customer - permission check
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (req.user && req.user.role === "sales") {
      return res.status(403).json({ message: "Access denied" });
    }

    await customer.deleteOne();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};