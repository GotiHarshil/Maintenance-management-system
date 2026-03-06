const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, unique: true, sparse: true },
  model: { type: String, default: "" },
  manufacturer: { type: String, default: "" },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  purchaseDate: { type: Date },
  warrantyExpiry: { type: Date },
  status: {
    type: String,
    enum: ["ACTIVE", "UNDER_MAINTENANCE", "DECOMMISSIONED"],
    default: "ACTIVE",
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

assetSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

assetSchema.index({ locationId: 1 });
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ status: 1 });

module.exports = mongoose.model("Asset", assetSchema);
