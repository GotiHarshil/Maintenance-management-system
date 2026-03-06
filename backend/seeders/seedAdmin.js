const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const Role = require("../models/Role");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminRole = await Role.findOne({ name: "ADMIN" });
    if (!adminRole) {
      console.error("ADMIN role not found. Run `npm run seed` first.");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: "admin@somms.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    await User.create({
      fullName: "System Admin",
      email: "admin@somms.com",
      phone: "+1234567890",
      passwordHash: "Admin@123456", // pre-save hook hashes it
      roleId: adminRole._id,
      isActive: true,
    });

    console.log("Admin user created:");
    console.log("  Email: admin@somms.com");
    console.log("  Password: Admin@123456");
    console.log("  ⚠ Change this password immediately in production!");

    process.exit(0);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
