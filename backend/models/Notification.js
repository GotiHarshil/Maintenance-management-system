const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    default: null,
  },
  type: {
    type: String,
    enum: [
      "TICKET_ASSIGNED",
      "ESTIMATE_SUBMITTED",
      "ESTIMATE_APPROVED",
      "ESTIMATE_REJECTED",
      "WORK_STARTED",
      "WORK_COMPLETED",
      "WORK_VERIFIED",
      "WORK_DISPUTED",
      "INVOICE_GENERATED",
      "PAYMENT_RECEIVED",
      "SLA_WARNING",
      "SLA_BREACHED",
    ],
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// TTL: auto-delete read notifications after 30 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000, partialFilterExpression: { isRead: true } }
);

module.exports = mongoose.model("Notification", notificationSchema);
