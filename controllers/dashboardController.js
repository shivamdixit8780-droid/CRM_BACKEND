const Lead = require("../models/Lead");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const getDashboardOverview = async (req, res) => {
  try {
    const { employeeId } = req.query;

    // ✅ Role-based filters
    let leadFilter = {};
    let orderFilter = {};
    let customerFilter = {};   // ✅ Customer ke liye bhi filter

    if (req.user.role === "sales") {
      // Sales user - sirf apna data
      leadFilter = { assignedTo: req.user._id };
      orderFilter = { createdBy: req.user._id };
      customerFilter = { createdBy: req.user._id };  // ✅
    } else if (employeeId) {
      // Admin ne specific employee select kiya
      leadFilter = { assignedTo: employeeId };
      orderFilter = { createdBy: employeeId };
      customerFilter = { createdBy: employeeId };    // ✅
    }
    // Admin bina employeeId ke - saara data (empty filter)

    // ✅ Current month date filter
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    // 1. Counts
    const totalLeads = await Lead.countDocuments(leadFilter);
    const totalCustomers = await Customer.countDocuments(customerFilter); // ✅ Filter add
    const totalOrders = await Order.countDocuments({ ...dateFilter, ...orderFilter });

    // ✅ 2. TOTAL SALES = All orders EXCEPT Cancelled
    const totalSalesResult = await Order.aggregate([
      {
        $match: {
          ...orderFilter,
          ...dateFilter,
          status: { $ne: "Cancelled" }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    // ✅ 3. REVENUE = Only Delivered Orders + Customers
    const deliveredOrdersRevenue = await Order.aggregate([
      {
        $match: {
          ...orderFilter,
          ...dateFilter,
          status: "Delivered"
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const deliveredOrdersTotal = deliveredOrdersRevenue.length > 0 ? deliveredOrdersRevenue[0].total : 0;

    // ✅ Customer revenue mein bhi filter add
    const customersRevenue = await Customer.aggregate([
      { $match: { ...customerFilter, ...dateFilter } },  // ✅
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const customersTotal = customersRevenue.length > 0 ? customersRevenue[0].total : 0;

    const revenue = deliveredOrdersTotal + customersTotal;

    // 4. Leads by Status
    const leadsByStatus = await Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 5. Revenue Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const deliveredTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "Delivered",
          ...orderFilter,
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ✅ Customer trend mein bhi filter add
    const customerTrend = await Customer.aggregate([
      {
        $match: { 
          ...customerFilter,                             // ✅
          createdAt: { $gte: sixMonthsAgo } 
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() - i;
      const delivered = deliveredTrend.find(t => t._id.year === year && t._id.month === (month + 1));
      const customer = customerTrend.find(t => t._id.year === year && t._id.month === (month + 1));
      revenueTrend.push({
        _id: { year, month: month + 1 },
        total: (delivered?.total || 0) + (customer?.total || 0),
      });
    }

    // 6. Orders by Status
    const ordersByStatus = await Order.aggregate([
      { $match: { ...dateFilter, ...orderFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 7. Recent Leads
    const recentLeads = await Lead.find(leadFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email phone source status createdAt");

    // 8. Recent Orders
    const recentOrdersRaw = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("customerName email phone product amount status createdAt");

    const recentOrders = recentOrdersRaw.map((order) => ({
      _id: order._id,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      product: order.product,
      customerName: order.customerName,
      customer: { name: order.customerName || "N/A", email: order.email || "" },
    }));

    res.status(200).json({
      totalLeads,
      totalCustomers,
      totalOrders,
      revenue,
      totalSales,
      leadsByStatus,
      revenueTrend,
      ordersByStatus,
      recentLeads,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardOverview };