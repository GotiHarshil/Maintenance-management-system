const WorkLog = require("../models/WorkLog");
const Ticket = require("../models/Ticket");
const { workLogValidator } = require("../utils/validators");

// POST /api/work-logs
const createWorkLog = async (req, res, next) => {
  try {
    const { error } = workLogValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Ticket must be IN_PROGRESS to log work" });
    }

    if (String(ticket.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the assigned technician can log work" });
    }

    const workLog = await WorkLog.create({
      ...req.body,
      technicianId: req.user._id,
    });

    res.status(201).json(workLog);
  } catch (error) {
    next(error);
  }
};

// GET /api/work-logs/ticket/:ticketId
const getWorkLogsByTicket = async (req, res, next) => {
  try {
    const workLogs = await WorkLog.find({ ticketId: req.params.ticketId })
      .populate("technicianId", "fullName")
      .sort({ loggedAt: -1 });

    res.json(workLogs);
  } catch (error) {
    next(error);
  }
};

// GET /api/work-logs/my
const getMyWorkLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const workLogs = await WorkLog.find({ technicianId: req.user._id })
      .populate("ticketId", "ticketNumber title status")
      .sort({ loggedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WorkLog.countDocuments({ technicianId: req.user._id });

    res.json({
      workLogs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createWorkLog, getWorkLogsByTicket, getMyWorkLogs };
