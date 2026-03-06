const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  changeReason: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  changedAt: { type: Date, default: Date.now },
});

statusHistorySchema.index({ ticketId: 1, changedAt: -1 });
statusHistorySchema.index({ changedBy: 1 });

module.exports = mongoose.model("TicketStatusHistory", statusHistorySchema);
