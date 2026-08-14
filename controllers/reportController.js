const Lead = require('../models/Lead');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date range setup
    let from, to;
    if (startDate && endDate) {
      from = new Date(startDate);
      to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    const dateFilter = { createdAt: { $gte: from, $lte: to } };

    // ✅ Alag alag filters banao (kyunki fields different hain)
    const leadFilter = req.user.role === 'sales' 
      ? { assignedTo: req.user._id }        // Lead mein assignedTo
      : {};

    const orderFilter = req.user.role === 'sales' 
      ? { createdBy: req.user._id }         // ✅ Order mein createdBy
      : {};

    const customerFilter = req.user.role === 'sales' 
      ? { createdBy: req.user._id }         // ✅ Customer mein createdBy
      : {};

    // 1. Total Leads
    const totalLeads = await Lead.countDocuments({ ...dateFilter, ...leadFilter });

    // 2. Converted Leads
    const convertedLeads = await Lead.countDocuments({ 
      ...dateFilter, 
      ...leadFilter, 
      status: 'Converted' 
    });

    // 3. Total Orders
    const totalOrders = await Order.countDocuments({ ...dateFilter, ...orderFilter });

    // ✅ 4. TOTAL SALES = All orders EXCEPT Cancelled
    const totalSalesResult = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          ...orderFilter,
          status: { $ne: "Cancelled" }
        }
      },
      { $group: { _id: null, totalSales: { $sum: "$amount" } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // ✅ 5. REVENUE = Delivered Orders + Customers
    const deliveredOrdersRevenue = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          ...orderFilter,
          status: "Delivered"
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const deliveredOrdersTotal = deliveredOrdersRevenue.length > 0 ? deliveredOrdersRevenue[0].total : 0;

    // ✅ Customer filter add kiya
    const customersRevenue = await Customer.aggregate([
      { $match: { ...dateFilter, ...customerFilter } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const customersTotal = customersRevenue.length > 0 ? customersRevenue[0].total : 0;
    const revenue = deliveredOrdersTotal + customersTotal;

    // 6. Monthly Revenue Trend (Last 6 Months)
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

      const deliveredResult = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: "Delivered",
            ...orderFilter,     // ✅ Sahi filter
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // ✅ Customer filter add kiya
      const customerResult = await Customer.aggregate([
        { 
          $match: { 
            createdAt: { $gte: start, $lte: end },
            ...customerFilter 
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      monthlyRevenue.push({
        month: start.toLocaleString("en-IN", { month: "short" }),
        revenue: (deliveredResult.length ? deliveredResult[0].total : 0) +
                 (customerResult.length ? customerResult[0].total : 0),
      });
    }

    // 7. Lead Status Summary
    const leadStatus = await Lead.aggregate([
      { $match: { ...dateFilter, ...leadFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 8. Recent Activities
    const recentActivities = [];

    const recentLeads = await Lead.find(leadFilter)   // ✅ Filter add
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

    const recentCustomers = await Customer.find(customerFilter)  // ✅ Filter add
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

    const recentOrders = await Order.find(orderFilter)  // ✅ Filter add
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

    recentActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 9. Conversion Rate
    const conversionRate = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100).toFixed(2) 
      : "0.00";

    res.status(200).json({
      totalLeads,
      totalOrders,
      totalSales,
      revenue,
      deliveredRevenue: revenue,
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