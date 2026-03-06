const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["BUILDING", "FLOOR", "ROOM", "ZONE", "CAMPUS"],
    required: true,
  },
  parentLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  description: { type: String, default: "" },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

locationSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

locationSchema.index({ parentLocationId: 1 });
locationSchema.index({ type: 1 });
locationSchema.index({ organizationId: 1 });

module.exports = mongoose.model("Location", locationSchema);
