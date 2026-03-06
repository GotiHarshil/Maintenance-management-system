const Invoice = require("../models/Invoice");
const Ticket = require("../models/Ticket");
const Estimate = require("../models/Estimate");
const Notification = require("../models/Notification");
const { generateInvoiceNumber } = require("../utils/invoiceNumberGenerator");

// POST /api/invoices
const generateInvoice = async (req, res, next) => {
  try {
    const { ticketId, taxRate = 0.18 } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status !== "VERIFIED") {
      return res.status(400).json({ message: "Ticket must be VERIFIED before generating invoice" });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ ticketId, status: { $ne: "CANCELLED" } });
    if (existingInvoice) {
      return res.status(409).json({ message: "Invoice already exists for this ticket" });
    }

    // Get approved estimate
    const estimate = await Estimate.findOne({ ticketId, status: "APPROVED" });
    if (!estimate) {
      return res.status(400).json({ message: "No approved estimate found for this ticket" });
    }

    const subtotal = estimate.totalEstimatedCost;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const invoice = await Invoice.create({
      ticketId,
      invoiceNumber: await generateInvoiceNumber(),
      visitCost: estimate.visitCost,
      laborCost: estimate.laborCost,
      materialCost: estimate.materialCost,
      otherCost: estimate.otherCost,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      generatedBy: req.user._id,
      organizationId: req.user.organizationId,
    });

    // Notify ticket creator
    await Notification.create({
      userId: ticket.createdBy,
      ticketId: ticket._id,
      type: "INVOICE_GENERATED",
      message: `Invoice ${invoice.invoiceNumber} generated: ₹${invoice.totalAmount}`,
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate("ticketId", "ticketNumber title")
      .populate("generatedBy", "fullName")
      .sort({ generatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("ticketId")
      .populate("generatedBy", "fullName email");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateInvoice, getInvoices, getInvoiceById };
