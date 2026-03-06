const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");
const { paymentValidator } = require("../utils/validators");

// POST /api/payments
const recordPayment = async (req, res, next) => {
  try {
    const { error } = paymentValidator.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (invoice.status === "PAID") {
      return res.status(400).json({ message: "Invoice is already fully paid" });
    }

    if (invoice.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot pay a cancelled invoice" });
    }

    const payment = await Payment.create({
      ...req.body,
      receivedBy: req.user._id,
    });

    // Calculate total payments for this invoice
    const allPayments = await Payment.find({ invoiceId: invoice._id });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    if (totalPaid >= invoice.totalAmount) {
      invoice.status = "PAID";
      invoice.paidAt = new Date();
    } else {
      invoice.status = "PARTIALLY_PAID";
    }
    await invoice.save();

    // Notify ticket creator
    const ticket = await Ticket.findById(invoice.ticketId);
    if (ticket) {
      await Notification.create({
        userId: ticket.createdBy,
        ticketId: ticket._id,
        type: "PAYMENT_RECEIVED",
        message: `Payment of ₹${payment.amountPaid} received for invoice ${invoice.invoiceNumber}`,
      });
    }

    res.status(201).json({ payment, invoiceStatus: invoice.status, totalPaid });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/invoice/:invoiceId
const getPaymentsByInvoice = async (req, res, next) => {
  try {
    const payments = await Payment.find({ invoiceId: req.params.invoiceId })
      .populate("receivedBy", "fullName")
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};

module.exports = { recordPayment, getPaymentsByInvoice };
