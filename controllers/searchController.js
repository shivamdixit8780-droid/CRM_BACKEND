const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const FollowUp = require("../models/FollowUp");
const Product = require("../models/Product");
const User = require("../models/User");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json({
        leads: [],
        customers: [],
        orders: [],
        followups: [],
        products: [],
        users: [],
      });
    }

    const regex = new RegExp(q, "i");

    const roleFilter =
      req.user.role === "sales"
        ? { assignedTo: req.user._id }
        : {};

    const [
      leads,
      customers,
      orders,
      followups,
      products,
      users,
    ] = await Promise.all([

      // Leads
      Lead.find({
        ...roleFilter,
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
        ],
      }).limit(5),

      // Customers
      Customer.find({
        ...roleFilter,
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
        ],
      }).limit(5),

      // Orders
      Order.find({
        ...roleFilter,
        $or: [
          { status: regex },
          { notes: regex },
        ],
      })
        .populate("customer", "name")
        .limit(5),

      // FollowUps
      FollowUp.find({
        ...roleFilter,
        $or: [
          { note: regex },
          { status: regex },
        ],
      })
        .populate("lead", "name")
        .populate("customer", "name")
        .limit(5),

      // Products
      Product.find({
        $or: [
          { name: regex },
          { category: regex },
          { description: regex },
        ],
      }).limit(5),

      // Users
      User.find({
        $or: [
          { name: regex },
          { email: regex },
        ],
      })
        .select("name email role")
        .limit(5),
    ]);

    return res.status(200).json({
      leads,
      customers,
      orders,
      followups,
      products,
      users,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
};

module.exports = {
  globalSearch,
};