const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String, default: null },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Exclude deleted users from queries by default
userSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ roleId: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });

module.exports = mongoose.model("User", userSchema);
