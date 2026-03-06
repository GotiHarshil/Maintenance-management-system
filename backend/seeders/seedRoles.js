const mongoose = require("mongoose");
require("dotenv").config();
const Role = require("../models/Role");

const roles = [
  {
    name: "ADMIN",
    permissions: [
      "CREATE_TICKET", "VIEW_ALL_TICKETS", "ASSIGN_TICKET",
      "APPROVE_ESTIMATE", "REJECT_ESTIMATE", "VERIFY_WORK",
      "GENERATE_INVOICE", "CLOSE_TICKET", "VIEW_REPORTS",
      "MANAGE_USERS", "MANAGE_LOCATIONS", "MANAGE_ASSETS",
    ],
  },
  {
    name: "TECHNICIAN",
    permissions: [
      "VIEW_OWN_TICKETS", "ACCEPT_TICKET", "SUBMIT_ESTIMATE",
      "START_WORK", "COMPLETE_WORK",
    ],
  },
  {
    name: "USER",
    permissions: [
      "CREATE_TICKET", "VIEW_OWN_TICKETS", "APPROVE_ESTIMATE",
      "REJECT_ESTIMATE", "VERIFY_WORK", "DISPUTE_WORK",
    ],
  },
  {
    name: "FINANCE",
    permissions: [
      "VIEW_ALL_TICKETS", "GENERATE_INVOICE", "RECORD_PAYMENT",
      "VIEW_REPORTS",
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Role.deleteMany({});
    const created = await Role.insertMany(roles);

    console.log("Roles seeded successfully:");
    created.forEach((r) => console.log(`  - ${r.name} (${r.permissions.length} permissions)`));

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
