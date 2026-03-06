const mongoose = require("mongoose");

const estimateSchema = new mongoose.Schema(
  {
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
    lineItems: [
      {
        description: { type: String, required: true },
        category: {
          type: String,
          enum: ["VISIT", "LABOR", "MATERIAL", "OTHER"],
          required: true,
        },
        quantity: { type: Number, default: 1, min: 0 },
        unitCost: { type: Number, required: true, min: 0 },
        totalCost: { type: Number, required: true, min: 0 },
      },
    ],

    // Summary costs
    visitCost: { type: Number, default: 0, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    materialCost: { type: Number, default: 0, min: 0 },
    otherCost: { type: Number, default: 0, min: 0 },
    totalEstimatedCost: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REVISED"],
      default: "PENDING",
    },
    approvedByUser: { type: Boolean, default: false },
    approvedByAdmin: { type: Boolean, default: false },
    rejectionReason: { type: String, default: null },

    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Auto-calculate total from line items if present
estimateSchema.pre("save", function (next) {
  if (this.lineItems && this.lineItems.length > 0) {
    this.visitCost = this.lineItems
      .filter((i) => i.category === "VISIT")
      .reduce((sum, i) => sum + i.totalCost, 0);
    this.laborCost = this.lineItems
      .filter((i) => i.category === "LABOR")
      .reduce((sum, i) => sum + i.totalCost, 0);
    this.materialCost = this.lineItems
      .filter((i) => i.category === "MATERIAL")
      .reduce((sum, i) => sum + i.totalCost, 0);
    this.otherCost = this.lineItems
      .filter((i) => i.category === "OTHER")
      .reduce((sum, i) => sum + i.totalCost, 0);
    this.totalEstimatedCost =
      this.visitCost + this.laborCost + this.materialCost + this.otherCost;
  }
  next();
});

estimateSchema.index({ ticketId: 1 });
estimateSchema.index({ technicianId: 1 });
estimateSchema.index({ status: 1 });

module.exports = mongoose.model("Estimate", estimateSchema);
