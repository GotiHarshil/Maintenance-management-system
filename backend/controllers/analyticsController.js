const Ticket = require("../models/Ticket");
const Invoice = require("../models/Invoice");
const WorkLog = require("../models/WorkLog");

// GET /api/analytics/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const orgFilter = req.user.organizationId
      ? { organizationId: req.user.organizationId }
      : {};

    // Ticket counts by status
    const ticketsByStatus = await Ticket.aggregate([
      { $match: { isDeleted: false, ...orgFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      { $match: { isDeleted: false, ...orgFilter } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Tickets by category
    const ticketsByCategory = await Ticket.aggregate([
      { $match: { isDeleted: false, ...orgFilter } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // SLA stats
    const totalTickets = await Ticket.countDocuments({ isDeleted: false, ...orgFilter });
    const slaBreached = await Ticket.countDocuments({
      slaBreached: true,
      isDeleted: false,
      ...orgFilter,
    });
    const slaComplianceRate = totalTickets > 0
      ? Math.round(((totalTickets - slaBreached) / totalTickets) * 100 * 10) / 10
      : 100;

    // Revenue stats
    const revenueStats = await Invoice.aggregate([
      { $match: { status: "PAID" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 },
          avgInvoice: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Monthly ticket trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          isDeleted: false,
          ...orgFilter,
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Average resolution time (hours)
    const avgResolution = await Ticket.aggregate([
      {
        $match: {
          status: "CLOSED",
          closedAt: { $ne: null },
          isDeleted: false,
          ...orgFilter,
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ["$closedAt", "$createdAt"] }, 3600000],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: "$resolutionHours" } } },
    ]);

    // Top technicians by completed tickets
    const topTechnicians = await Ticket.aggregate([
      {
        $match: {
          status: { $in: ["VERIFIED", "BILLED", "PAID", "CLOSED"] },
          assignedTo: { $ne: null },
          isDeleted: false,
          ...orgFilter,
        },
      },
      { $group: { _id: "$assignedTo", completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "technician",
        },
      },
      { $unwind: "$technician" },
      {
        $project: {
          fullName: "$technician.fullName",
          completedCount: 1,
        },
      },
    ]);

    res.json({
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      slaStats: { totalTickets, slaBreached, slaComplianceRate },
      revenueStats: revenueStats[0] || {
        totalRevenue: 0,
        invoiceCount: 0,
        avgInvoice: 0,
      },
      monthlyTrend,
      avgResolutionHours: Math.round((avgResolution[0]?.avgHours || 0) * 10) / 10,
      topTechnicians,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
