const Lead = require('../models/Lead');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const getDashboardOverview = async (req, res) => {
  try {
    const { employeeId } = req.query;

    let roleFilter = {};

    if (req.user.role === "sales") {
      roleFilter = {
        assignedTo: req.user._id,
      };
    } else if (employeeId) {
      roleFilter = {
        assignedTo: employeeId,
      };
    }

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    console.log("dateFilter:", dateFilter);
    console.log("roleFilter:", roleFilter);
    const totalLeads = await Lead.countDocuments({...roleFilter });
    const totalCustomers = await Customer.countDocuments({ ...roleFilter });
    const totalOrders = await Order.countDocuments({ ...dateFilter, ...roleFilter });

    const revenueResult = await Order.aggregate([
      { $match: { ...roleFilter } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const leadsByStatus = await Lead.aggregate([
      { $match: roleFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, ...roleFilter } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: roleFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentLeads = await Lead.find(roleFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email phone source status createdAt');

    const recentOrders = await Order.find(roleFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .select('amount status createdAt customer');

    res.status(200).json({
      totalLeads,
      totalCustomers,
      totalOrders,
      revenue,
      leadsByStatus,
      revenueTrend,
      ordersByStatus,
      recentLeads,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardOverview };