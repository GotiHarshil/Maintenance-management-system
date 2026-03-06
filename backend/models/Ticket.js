const mongoose = require("mongoose");

const TICKET_STATUSES = [
  "CREATED",
  "REVIEWED",
  "ASSIGNED",
  "ACCEPTED",
  "ESTIMATION_SUBMITTED",
  "ESTIMATION_APPROVED",
  "IN_PROGRESS",
  "ON_HOLD",
  "WORK_COMPLETED",
  "VERIFIED",
  "DISPUTED",
  "BILLED",
  "PAID",
  "CLOSED",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "STRUCTURAL",
  "CLEANING",
  "IT_NETWORK",
  "FURNITURE",
  "SECURITY",
  "OTHER",
];

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true },
    priority: { type: String, enum: PRIORITIES, default: "MEDIUM" },
    status: { type: String, enum: TICKET_STATUSES, default: "CREATED" },

    // People references
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Location & Asset
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      default: null,
    },

    // SLA
    slaDeadline: { type: Date },
    slaBreached: { type: Boolean, default: false },

    // Lifecycle timestamps
    assignedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    workStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },

    // Evidence images
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],

    // Enterprise fields
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Exclude deleted tickets from queries by default
ticketSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

// Indexes
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ status: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ organizationId: 1, status: 1 });
ticketSchema.index({ slaDeadline: 1, slaBreached: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
module.exports.TICKET_STATUSES = TICKET_STATUSES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.CATEGORIES = CATEGORIES;
