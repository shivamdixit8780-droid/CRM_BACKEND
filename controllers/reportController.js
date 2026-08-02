const Lead = require('../models/Lead');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let from, to;

    if (startDate && endDate) {
      from = new Date(startDate);
      to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
    } else {
      // default: current month
      const now = new Date();
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    // agar sales role hai, to sirf apna data dikhega; admin/manager sabka
    const roleFilter = req.user.role === 'sales' ? { assignedTo: req.user._id } : {};

    // Total Leads (is range mein bane hue)
    const totalLeads = await Lead.countDocuments({ ...dateFilter, ...roleFilter });

    // Converted Leads (Sales count)
    const convertedLeads = await Lead.countDocuments({ ...dateFilter, ...roleFilter, status: 'Converted' });

    // Total Orders
    const totalOrders = await Order.countDocuments({ ...dateFilter, ...roleFilter });

    // Revenue — Orders ke amount ka sum
    const revenueResult = await Order.aggregate([
      { $match: { ...dateFilter, ...roleFilter } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    // Monthly Revenue Trend (Last 6 Months)

    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {

      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);

      const result = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            ...roleFilter,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      monthlyRevenue.push({
        month: start.toLocaleString("en-IN", {
          month: "short",
        }),
        revenue: result.length ? result[0].total : 0,
      });

    }
    // Lead Status Summary
    const leadStatus = await Lead.aggregate([
      {
        $match: {
          ...dateFilter,
          ...roleFilter,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    // Recent Activities
    const recentActivities = [];

    // Recent Leads
    const recentLeads = await Lead.find(roleFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt");

    recentLeads.forEach((lead) => {
      recentActivities.push({
        type: "Lead",
        title: `${lead.name} added as Lead`,
        createdAt: lead.createdAt,
      });
    });

    // Recent Customers
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt");

    recentCustomers.forEach((customer) => {
      recentActivities.push({
        type: "Customer",
        title: `${customer.name} added as Customer`,
        createdAt: customer.createdAt,
      });
    });

    // Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId createdAt");

    recentOrders.forEach((order) => {
      recentActivities.push({
        type: "Order",
        title: `Order ${order.orderId} created`,
        createdAt: order.createdAt,
      });
    });

    // Sort Latest First
    recentActivities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Conversion Rate
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : "0.00";

    res.status(200).json({
      totalLeads,
      totalOrders,
      totalSales: convertedLeads,
      revenue,
      conversionRate: `${conversionRate}%`,
      monthlyRevenue,
      leadStatus,
      dateRange: { from, to },
      recentActivities,
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports };