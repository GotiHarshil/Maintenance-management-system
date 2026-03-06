/**
 * Soft Delete Plugin for Mongoose
 *
 * Adds isDeleted and deletedAt fields, auto-filters deleted docs,
 * and provides softDelete() and restore() instance methods.
 *
 * Usage: schema.plugin(require("./plugins/softDelete"));
 */
module.exports = function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  // Automatically exclude deleted docs from all find queries
  schema.pre(/^find/, function (next) {
    if (this.getOptions().includeDeleted !== true) {
      this.where({ isDeleted: false });
    }
    next();
  });

  // Soft delete method
  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  // Restore method
  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };
};
