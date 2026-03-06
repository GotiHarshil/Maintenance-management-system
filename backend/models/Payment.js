const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["CASH", "CARD", "BANK_TRANSFER", "UPI", "CHEQUE"],
    required: true,
  },
  transactionId: { type: String, default: null },
  amountPaid: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: { type: String, default: "" },
});

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
