const mongoose = require("mongoose");

const workLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  workDescription: { type: String, required: true, maxlength: 2000 },
  hoursWorked: { type: Number, required: true, min: 0.25 },
  materialsUsed: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 },
      cost: { type: Number, required: true, min: 0 },
    },
  ],
  totalMaterialCost: { type: Number, default: 0 },
  images: [{ type: String }],
  loggedAt: { type: Date, default: Date.now },
});

// Auto-calculate total material cost
workLogSchema.pre("save", function (next) {
  this.totalMaterialCost = this.materialsUsed.reduce(
    (sum, m) => sum + m.quantity * m.cost,
    0
  );
  next();
});

workLogSchema.index({ ticketId: 1 });
workLogSchema.index({ technicianId: 1 });
workLogSchema.index({ loggedAt: -1 });

module.exports = mongoose.model("WorkLog", workLogSchema);
