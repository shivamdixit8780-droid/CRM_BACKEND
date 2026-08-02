const Order = require('../models/Order');

// Create order
const createOrder = async (req, res) => {
  try {
    const { customer, amount, status, notes, assignedTo } = req.body;

    const order = await Order.create({
      customer,
      amount,
      status,
      notes,
      assignedTo: assignedTo || req.user._id,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders — with date-range filter (default: current month)
const getOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let from, to;

    if (startDate && endDate) {
      // agar user ne khud dates bheji hain, wahi use karo
      from = new Date(startDate);
      to = new Date(endDate);
      to.setHours(23, 59, 59, 999); // poora din cover karne ke liye
    } else {
      // default: current month ka pehla aur aakhri din
      const now = new Date();
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    let orders;

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      orders = await Order.find(dateFilter)
        .populate('customer', 'name email phone')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ ...dateFilter, assignedTo: req.user._id })
        .populate('customer', 'name email phone')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name email role');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'sales' && order.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'sales' && order.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'sales') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await order.deleteOne();

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};