const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const Role = require("../models/Role");

const testUsers = [
  {
    fullName: "Rajesh Kumar",
    email: "rajesh@somms.com",
    phone: "+91-9876543210",
    password: "Tech@12345",
    roleName: "TECHNICIAN",
  },
  {
    fullName: "Suresh Mehta",
    email: "suresh@somms.com",
    phone: "+91-9876543213",
    password: "Tech@12345",
    roleName: "TECHNICIAN",
  },
  {
    fullName: "Priya Sharma",
    email: "priya@somms.com",
    phone: "+91-9876543211",
    password: "User@12345",
    roleName: "USER",
  },
  {
    fullName: "Anita Verma",
    email: "anita@somms.com",
    phone: "+91-9876543214",
    password: "User@12345",
    roleName: "USER",
  },
  {
    fullName: "Amit Finance",
    email: "amit@somms.com",
    phone: "+91-9876543212",
    password: "Finance@12345",
    roleName: "FINANCE",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Get all roles
    const roles = await Role.find({});
    console.log("Found roles:");
    roles.forEach((r) => console.log(`  ${r.name} → ${r._id}`));
    console.log("");

    // Create each user
    for (const userData of testUsers) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`SKIP: ${userData.email} already exists (${userData.roleName})`);
        continue;
      }

      // Find the role
      const role = roles.find((r) => r.name === userData.roleName);
      if (!role) {
        console.log(`ERROR: Role ${userData.roleName} not found!`);
        continue;
      }

      // Create user
      await User.create({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.password, // pre-save hook will hash this
        roleId: role._id,
        isActive: true,
      });

      console.log(`CREATED: ${userData.fullName} (${userData.email}) → ${userData.roleName}`);
    }

    console.log("\n========================================");
    console.log("  ALL TEST USERS CREATED SUCCESSFULLY");
    console.log("========================================\n");
    console.log("Login Credentials:");
    console.log("------------------------------------------");
    console.log("ADMIN:");
    console.log("  Email:    admin@somms.com");
    console.log("  Password: Admin@123456");
    console.log("");
    console.log("TECHNICIAN 1:");
    console.log("  Email:    rajesh@somms.com");
    console.log("  Password: Tech@12345");
    console.log("");
    console.log("TECHNICIAN 2:");
    console.log("  Email:    suresh@somms.com");
    console.log("  Password: Tech@12345");
    console.log("");
    console.log("USER 1:");
    console.log("  Email:    priya@somms.com");
    console.log("  Password: User@12345");
    console.log("");
    console.log("USER 2:");
    console.log("  Email:    anita@somms.com");
    console.log("  Password: User@12345");
    console.log("");
    console.log("FINANCE:");
    console.log("  Email:    amit@somms.com");
    console.log("  Password: Finance@12345");
    console.log("------------------------------------------\n");

    // Show total users in DB
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
