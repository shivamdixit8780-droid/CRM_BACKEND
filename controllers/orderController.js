const Order = require("../models/Order");
const Customer = require("../models/Customer");

// ✅ Get Orders - Role based filter
exports.getOrders = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let filter = {};

    // ✅ Sales user - sirf apne orders
    if (req.user.role === "sales") {
      filter.createdBy = req.user._id;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single order - permission check
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Sales user sirf apna order dekh sake
    if (
      req.user.role === "sales" &&
      order.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create Order - createdBy already hai
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName, email, phone, address, pincode,
      city, state, product, amount, status, notes,
    } = req.body;

    const newOrder = await Order.create({
      customerName, email, phone, address, pincode,
      city, state, product, amount, status, notes,
      createdBy: req.user?._id,   // ✅ Already tha
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Sales user sirf apna order update kare
    if (
      req.user.role === "sales" &&
      order.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Jab status "Delivered" ho
    if (updateData.status === "Delivered") {
      try {
        const email = updateData.email || order.email;
        
        // ✅ IMPORTANT: existing customer bhi user ke andar dhundo
        const existingCustomer = email
          ? await Customer.findOne({ 
              email,
              createdBy: order.createdBy   // ✅ Same user ka customer
            })
          : null;

        if (!existingCustomer) {
          await Customer.create({
            name: updateData.customerName || order.customerName,
            email: email,
            phone: updateData.phone || order.phone,
            address: updateData.address || order.address,
            pincode: updateData.pincode || order.pincode,
            city: updateData.city || order.city,
            state: updateData.state || order.state,
            product: updateData.product || order.product,
            totalAmount: Number(updateData.amount || order.amount),
            orderId: order._id,
            leadCode: order.leadCode || "",
            source: "Order",
            createdBy: order.createdBy,   // ✅ IMPORTANT - user link save karo
          });
          console.log("✅ New Customer created from Delivered Order");
        } else {
          existingCustomer.totalAmount =
            (existingCustomer.totalAmount || 0) +
            Number(updateData.amount || order.amount);
          if (!existingCustomer.product && (updateData.product || order.product)) {
            existingCustomer.product = updateData.product || order.product;
          }
          if (!existingCustomer.leadCode && order.leadCode) {
            existingCustomer.leadCode = order.leadCode;
          }
          await existingCustomer.save();
          console.log("✅ Existing customer amount updated");
        }

        await Order.findByIdAndDelete(id);
        console.log("🗑️ Order removed from Orders (moved to Customers)");

        return res.json({
          success: true,
          message: "Order Delivered! Moved to Customers.",
          moved: true,
        });
      } catch (cErr) {
        console.error("⚠️ Customer create error:", cErr.message);
        return res.status(500).json({ message: cErr.message });
      }
    }

    // Normal update
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ Update order error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Order - permission check
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Sales user sirf apna order delete kare
    if (
      req.user.role === "sales" &&
      order.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};