const Estimate = require("../models/Estimate");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const { estimateValidator } = require("../utils/validators");

// POST /api/estimates
const createEstimate = async (req, res, next) => {
  try {
    const { error } = estimateValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "ACCEPTED" && ticket.status !== "ESTIMATION_SUBMITTED") {
      return res.status(400).json({
        message: "Ticket must be in ACCEPTED or ESTIMATION_SUBMITTED status",
      });
    }

    // Calculate total if not provided
    const totalEstimatedCost =
      (req.body.visitCost || 0) +
      (req.body.laborCost || 0) +
      (req.body.materialCost || 0) +
      (req.body.otherCost || 0);

    const estimate = await Estimate.create({
      ...req.body,
      technicianId: req.user._id,
      totalEstimatedCost: req.body.totalEstimatedCost || totalEstimatedCost,
    });

    // Notify ticket creator
    await Notification.create({
      userId: ticket.createdBy,
      ticketId: ticket._id,
      type: "ESTIMATE_SUBMITTED",
      message: `Estimate submitted for ticket ${ticket.ticketNumber}: ₹${estimate.totalEstimatedCost}`,
    });

    res.status(201).json(estimate);
  } catch (error) {
    next(error);
  }
};

// GET /api/estimates/ticket/:ticketId
const getEstimatesByTicket = async (req, res, next) => {
  try {
    const estimates = await Estimate.find({ ticketId: req.params.ticketId })
      .populate("technicianId", "fullName email")
      .sort({ createdAt: -1 });

    res.json(estimates);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/estimates/:id/approve
const approveEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: "Estimate not found" });

    const userRole = req.user.roleId.name;

    if (userRole === "USER") {
      estimate.approvedByUser = true;
    } else if (userRole === "ADMIN") {
      estimate.approvedByAdmin = true;
    }

    // Fully approved when both approve (or just admin for some orgs)
    if (estimate.approvedByUser || estimate.approvedByAdmin) {
      estimate.status = "APPROVED";
    }

    await estimate.save();

    // Notify technician
    await Notification.create({
      userId: estimate.technicianId,
      ticketId: estimate.ticketId,
      type: "ESTIMATE_APPROVED",
      message: `Your estimate has been approved`,
    });

    res.json(estimate);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/estimates/:id/reject
const rejectEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: "Estimate not found" });

    estimate.status = "REJECTED";
    estimate.rejectionReason = req.body.reason || "No reason provided";
    await estimate.save();

    // Notify technician
    await Notification.create({
      userId: estimate.technicianId,
      ticketId: estimate.ticketId,
      type: "ESTIMATE_REJECTED",
      message: `Your estimate was rejected: ${estimate.rejectionReason}`,
    });

    res.json(estimate);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEstimate,
  getEstimatesByTicket,
  approveEstimate,
  rejectEstimate,
};
