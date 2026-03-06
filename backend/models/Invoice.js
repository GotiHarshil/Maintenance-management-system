const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  invoiceNumber: { type: String, unique: true, required: true },

  // Cost breakdown
  visitCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  materialCost: { type: Number, default: 0 },
  otherCost: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0.18 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["GENERATED", "SENT", "PAID", "PARTIALLY_PAID", "CANCELLED", "OVERDUE"],
    default: "GENERATED",
  },

  dueDate: { type: Date },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  generatedAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
});

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ ticketId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
