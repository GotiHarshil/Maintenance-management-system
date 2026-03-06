const Ticket = require("../models/Ticket");
const TicketStatusHistory = require("../models/TicketStatusHistory");
const Notification = require("../models/Notification");
const { generateTicketNumber } = require("../utils/ticketNumberGenerator");
const { calculateSLADeadline } = require("../utils/slaCalculator");
const { ticketValidator, statusUpdateValidator } = require("../utils/validators");
const {
  isValidTransition,
  canUserTransition,
  getAvailableTransitions,
  ALLOWED_TRANSITIONS,
} = require("../utils/statusTransitions");

// POST /api/tickets
const createTicket = async (req, res, next) => {
  try {
    const { error } = ticketValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const ticketNumber = await generateTicketNumber();
    const slaDeadline = calculateSLADeadline(req.body.priority || "MEDIUM");

    const ticket = await Ticket.create({
      ...req.body,
      ticketNumber,
      slaDeadline,
      createdBy: req.user._id,
      organizationId: req.user.organizationId,
    });

    // Audit log
    await TicketStatusHistory.create({
      ticketId: ticket._id,
      previousStatus: "NONE",
      newStatus: "CREATED",
      changedBy: req.user._id,
      changeReason: "Ticket created",
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets
const getTickets = async (req, res, next) => {
  try {
    const {
      status, priority, category, assignedTo,
      page = 1, limit = 20, sortBy = "createdAt", order = "desc",
    } = req.query;

    const userRole = req.user.roleId.name;
    const filter = { isDeleted: false };

    // Role-based filtering
    if (userRole === "USER") {
      filter.createdBy = req.user._id;
    } else if (userRole === "TECHNICIAN") {
      filter.assignedTo = req.user._id;
    }

    // Optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo && ["ADMIN", "FINANCE"].includes(userRole)) {
      filter.assignedTo = assignedTo;
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("locationId", "name type")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "fullName email phone")
      .populate("assignedTo", "fullName email phone")
      .populate("reviewedBy", "fullName")
      .populate("locationId")
      .populate("assetId");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const userRole = req.user.roleId.name;
    const availableTransitions = getAvailableTransitions(ticket.status, userRole);

    res.json({ ...ticket.toObject(), availableTransitions });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tickets/:id/status
const updateTicketStatus = async (req, res, next) => {
  try {
    const { error } = statusUpdateValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { newStatus, reason, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 1. Validate transition
    if (!isValidTransition(ticket.status, newStatus)) {
      return res.status(400).json({
        message: `Invalid transition: ${ticket.status} → ${newStatus}`,
        allowed: ALLOWED_TRANSITIONS[ticket.status],
      });
    }

    // 2. Validate role permission
    const userRole = req.user.roleId.name;
    if (!canUserTransition(newStatus, userRole)) {
      return res.status(403).json({
        message: `Role ${userRole} cannot set status to ${newStatus}`,
      });
    }

    const previousStatus = ticket.status;
    ticket.status = newStatus;

    // 3. Handle status-specific logic
    switch (newStatus) {
      case "REVIEWED":
        ticket.reviewedBy = req.user._id;
        break;
      case "ASSIGNED":
        if (!assignedTo) {
          return res.status(400).json({ message: "assignedTo is required for ASSIGNED status" });
        }
        ticket.assignedTo = assignedTo;
        ticket.assignedAt = new Date();
        break;
      case "ACCEPTED":
        ticket.acceptedAt = new Date();
        break;
      case "IN_PROGRESS":
        if (!ticket.workStartedAt) ticket.workStartedAt = new Date();
        break;
      case "WORK_COMPLETED":
        ticket.completedAt = new Date();
        break;
      case "VERIFIED":
        ticket.verifiedAt = new Date();
        break;
      case "CLOSED":
        ticket.closedAt = new Date();
        break;
    }

    // 4. Check SLA breach
    if (ticket.slaDeadline && new Date() > ticket.slaDeadline) {
      ticket.slaBreached = true;
    }

    await ticket.save();

    // 5. Audit log
    await TicketStatusHistory.create({
      ticketId: ticket._id,
      previousStatus,
      newStatus,
      changedBy: req.user._id,
      changeReason: reason || `Status changed to ${newStatus}`,
    });

    // 6. Send notifications
    const notifyMap = {
      ASSIGNED:       { userId: ticket.assignedTo, type: "TICKET_ASSIGNED" },
      WORK_COMPLETED: { userId: ticket.createdBy, type: "WORK_COMPLETED" },
      VERIFIED:       { userId: ticket.assignedTo, type: "WORK_VERIFIED" },
      DISPUTED:       { userId: ticket.assignedTo, type: "WORK_DISPUTED" },
    };

    if (notifyMap[newStatus] && notifyMap[newStatus].userId) {
      await Notification.create({
        userId: notifyMap[newStatus].userId,
        ticketId: ticket._id,
        type: notifyMap[newStatus].type,
        message: `Ticket ${ticket.ticketNumber}: Status changed to ${newStatus}`,
      });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

// GET /api/tickets/:id/history
const getTicketHistory = async (req, res, next) => {
  try {
    const history = await TicketStatusHistory.find({ ticketId: req.params.id })
      .populate("changedBy", "fullName")
      .sort({ changedAt: 1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tickets/:id (soft delete)
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.isDeleted = true;
    ticket.deletedAt = new Date();
    await ticket.save();

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  getTicketHistory,
  deleteTicket,
};
