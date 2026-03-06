const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["ADMIN", "TECHNICIAN", "USER", "FINANCE"],
    required: true,
    unique: true,
  },
  permissions: [
    {
      type: String,
      enum: [
        "CREATE_TICKET",
        "VIEW_ALL_TICKETS",
        "VIEW_OWN_TICKETS",
        "ASSIGN_TICKET",
        "ACCEPT_TICKET",
        "SUBMIT_ESTIMATE",
        "APPROVE_ESTIMATE",
        "REJECT_ESTIMATE",
        "START_WORK",
        "COMPLETE_WORK",
        "VERIFY_WORK",
        "DISPUTE_WORK",
        "GENERATE_INVOICE",
        "RECORD_PAYMENT",
        "CLOSE_TICKET",
        "VIEW_REPORTS",
        "MANAGE_USERS",
        "MANAGE_LOCATIONS",
        "MANAGE_ASSETS",
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", roleSchema);
